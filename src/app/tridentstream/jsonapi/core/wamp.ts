import { Subject, Observable } from 'rxjs';
import { share, refCount, publishReplay } from 'rxjs/operators';

import { JSON_TYPES } from '../jsonapi';
import { ServiceResourceObject } from '../core/service';

import { Connection, Session } from 'autobahn';


export class WAMPServiceResourceObject extends ServiceResourceObject {
  protected connection: Connection;

  private waitConnected = new Subject<Session>();
  public waitConnected$ = this.waitConnected.asObservable().pipe(
    share(),
    publishReplay(1),
    refCount()
  );

  connect(username: string) {
    this.connection = new Connection({
      url: `ws${ this.links['self'].slice(4) }`,
      realm: `user.${ username }`,
      max_retries: -1
    });

    this.connection.onopen = (session, details) => this.waitConnected.next(session);
    this.connection.open();
  }

  disconnect() {
    this.connection.close();
  }
}

JSON_TYPES['service_wamp'] = WAMPServiceResourceObject;
