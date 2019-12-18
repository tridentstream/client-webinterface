import { $WebSocket, WebSocketSendMode } from 'angular2-websocket/angular2-websocket'

import { Subject, Observable } from 'rxjs';
import { share, delay } from 'rxjs/operators';

interface JSONRPCRequest {
  method: string,
  params?: {},
  id?: number | string,
}

interface JSONRPCResponse {
  result?: any,
  error?: any,
  id: number | string,
}

export class JSONRPCWebSocket {
  private url: string;
  private ws: $WebSocket;
  private callRegistry = new Map<number, Subject<any>>();
  private idCounter: number = 1;
  public connected: boolean = false;

  private onConnected = new Subject<void>();
  public onConnected$ = this.onConnected.asObservable().pipe(share());

  private onDisconnected = new Subject<void>();
  public onDisconnected$ = this.onDisconnected.asObservable().pipe(share());

  private commandRegistry = new Map<string, Subject<any>>();

  connect(url: string) {
    console.log('Calling connect');

    if (url.substring(0, 4) === 'http')
      this.url = 'ws' + url.slice(4);
    else
      this.url = url;

    this.onDisconnected$.pipe(
      delay(5000)
    ).subscribe(() => this.reconnect());
    this._connect();
  }

  call(method: string, params: Array<any> = []) {
    let id = this.idCounter++;
    return this._call(method, params, id);
  }

  notify(method: string, params: Array<any> = []) {
    this._call(method, params);
  }

  private _call = (method: string, params: Array<any>, id?: number): Observable<any> => {
    let cmd = {
      method: method,
      params: params,
    };

    if (id != null) {
      cmd['id'] = id;
    };

    this.sendData(cmd);

    return Observable.create((observer) => this.callRegistry.set(id, observer));
  }

  getCommandObservable(method: string) {
    return this.getCommandSubject(method).asObservable().pipe(share());
  }

  private sendData = (data: JSONRPCRequest | JSONRPCResponse) => {
    data['jsonrpc'] = '2.0';
    this.ws.send4Direct(JSON.stringify(data));
  }

  private getCommandSubject = (method: string) => {
    if (!this.commandRegistry.has(method)) {
      this.commandRegistry.set(method, new Subject<any>());
    }
    return this.commandRegistry.get(method);
  }

  private gotData = (data: MessageEvent) => {
    let msg = JSON.parse(data.data);
    console.log('Got message', msg);

    if ('id' in msg) { // this is a reply
      let id: number = +msg['id'];
      if (this.callRegistry.has(id)) {
        let cb = this.callRegistry.get(id);
        this.callRegistry.delete(id);
        if ('result' in msg) {
          cb.next(msg['result']);
          cb.complete();
        } else if ('error' in msg) {
          cb.error(msg['error']);
        }
      } else {
        console.log('Unknown reply to command', msg);
      }
    } else if ('method' in msg) {
      let cb = this.getCommandSubject(msg['method']);
      cb.next(msg['params']);
    } else {
      console.log('Got notification', msg);
    }
  }

  private reconnect = () => {
    this._connect();
  }

  private _connect = () => {
    let ws = new $WebSocket(this.url);
    this.ws = ws;
    ws.setSend4Mode(WebSocketSendMode.Direct);
    ws.getDataStream().subscribe((msg) => console.log(msg));
    ws.getDataStream().subscribe(this.gotData);
    ws.onOpen(() => {
      console.log('Connection made');
      this.connected = true;
      this.onConnected.next(null);
    });
    ws.onClose(() => {
      console.log('Connection lost');
      this.connected = false;
      this.onDisconnected.next(null);
      this.clearCommandRegistry();
    });
  }

  clearCommandRegistry() {
    this.commandRegistry.forEach((value) => value.complete());
    this.commandRegistry.clear();
  }

  close() {
    console.log('Closing websocket');
    this.clearCommandRegistry();
    this.ws.close();
  }
}
