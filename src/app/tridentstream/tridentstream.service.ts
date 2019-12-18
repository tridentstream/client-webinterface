import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { CanActivateChild, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { map, flatMap, catchError } from 'rxjs/operators';

import { ToastrService } from 'ngx-toastr';

import {
  JsonApiDocument,
  ResourceObject,
  UserInfoResourceObject,
  ConfigServiceResourceObject,
  ServiceResourceObject,
  PlayerServiceResourceObject,
  WAMPServiceResourceObject,
} from './jsonapi';
import {
  DownloadPlaybackDevice,
  PlaybackDevice,
  StreamProtocolPlaybackDevice,
  RemotePlayerPlaybackDevice
} from './playbackdevices';


@Injectable({
  providedIn: 'root'
})
export class Tridentstream implements OnDestroy {
  public api: JsonApiDocument;
  public userInfo: UserInfoResourceObject;
  public configService: ConfigServiceResourceObject;
  public playerService: PlayerServiceResourceObject;
  public wampService: WAMPServiceResourceObject;

  private serverUrl: string;

  private defaultPlaybackDevices: Array<PlaybackDevice> = [
    new DownloadPlaybackDevice(),
    new StreamProtocolPlaybackDevice(),
  ];

  public defaultPlaybackDevice: PlaybackDevice;
  public playbackDevices: Array<PlaybackDevice> = new Array<PlaybackDevice>();

  private playbackDeviceHistoryKey: string = "defaultPlaybackDeviceKey";

  constructor(private http: HttpClient, private toastr: ToastrService) { }

  checkAuth(): Observable<boolean> { // Check if we are auth and then initiate config
    if (this.userInfo) {
      if (this.userInfo.attributes['is_authenticated']) {
        return of(true);
      } else {
        return of(false);
      }
    }

    return this.populateConfig(this.defaultServerUrl).pipe(
      map(r => {
        if (!r) {
          return r;
        }

        return this.userInfo.attributes['is_authenticated'] || false;
      })
    );
  }

  populateConfig(serverUrl: string): Observable<boolean> {
    serverUrl = serverUrl.replace(/\/$/, '');
    this.serverUrl = serverUrl;
    this.userInfo = null;

    this.api = new JsonApiDocument(`${serverUrl}/api/`, this.http);
    return this.api.populate().pipe(
      flatMap((doc) => {
        let configService = doc.getOfType('service_config');
        this.configService = configService ? <ConfigServiceResourceObject>configService : null;

        if (!doc.getOfType('service_user')) {
          return of(false);
        }

        let userService = <ServiceResourceObject>doc.getOfType('service_user');

        if (!userService.hasAccess()) {
          return of(false);
        }

        return userService.getDocument().populate().pipe(
          map(userDoc => {
            this.userInfo = <UserInfoResourceObject>userDoc.getOfType('userinfo');
            this.connectPlayerService();
            this.updatePlaybackDevices();
            return true;
          })
        )
      }),
      catchError((err) => of(false))
    );
  }

  login(serverUrl: string, username: string, password: string): Observable<boolean> { // Logs in and then initiate config
    return this.populateConfig(serverUrl).pipe(
      flatMap((result) => {
        if (!result) {
          return of(false);
        }

        return this.userInfo.login(username, password).pipe(
          flatMap(result => {
            if (!result) {
              return of(false);
            }

            return this.populateConfig(serverUrl);
          })
        )
      }),
      catchError((err) => of(false))
    )
  }

  logout(): Observable<void> { // Logs out
    if (!this.userInfo) {
      return of(null);
    }

    return this.userInfo.logout();
  }

  getResourceObject<T extends ResourceObject>(type: string, id: string, urlPath: string, resourceObjectType: new (type: string, id: string, document?: JsonApiDocument) => T): T {
    let ro = new resourceObjectType(type, id, this.api);
    ro.links['self'] = `${ this.serverUrl }/${urlPath}`;
    return ro;
  }

  get defaultServerUrl() {
    return localStorage.getItem('server-url') || '/';
  }

  set defaultServerUrl(val: string) {
    localStorage.setItem('server-url', val);
  }

  connectWampService() {
    let wampService = <WAMPServiceResourceObject>this.api.getOfType('service_wamp');
    if (!wampService || !wampService.hasAccess()) {
      return;
    }

    let username = this.userInfo.attributes['username'];
    this.wampService = wampService;
    wampService.connect(username);
    wampService.waitConnected$.subscribe((session) => {
      session.subscribe('notification', (args, kwargs, details) => {
        if (kwargs['type'] == 'info') {
          this.toastr.info(kwargs['body'], kwargs['title']);
        }
      });
    });
  }

  connectPlayerService() {
    let playerService = <PlayerServiceResourceObject>this.api.getOfType('service_player');
    if (!playerService || !playerService.hasAccess()) {
      return;
    }

    this.playerService = playerService;
    playerService.connect();
    playerService.onPlayerChange.subscribe(() => this.updatePlaybackDevices());
  }

  updatePlaybackDevices() {
    let playbackdevices = new Array<PlaybackDevice>();

    playbackdevices = playbackdevices.concat(this.defaultPlaybackDevices);

    if (this.playerService) {
      for (let player of this.playerService.getPlayers()) {
        playbackdevices.push(new RemotePlayerPlaybackDevice(player));
      }
    }

    this.playbackDevices.length = 0;
    for (let pd of playbackdevices.filter((pd) => pd.isUsable())) {
      this.playbackDevices.push(pd);
    }

    this.resolveDefaultPlaybackDevice();
  }

  get storedPlaybackDevices(): Array<String> {
    let savedDevices = localStorage.getItem(this.playbackDeviceHistoryKey);
    let devices: Array<String> = [];
    if (savedDevices) {
      devices = <Array<String>>JSON.parse(savedDevices);
    }
    return devices;
  }

  set storedPlaybackDevices(devices: Array<String>) {
    localStorage.setItem(this.playbackDeviceHistoryKey, JSON.stringify(devices));
  }

  resolveDefaultPlaybackDevice() {
    let devices = this.storedPlaybackDevices;

    devices.push(this.defaultPlaybackDevices[0].identifier);
    for (let device of devices) {
      for (let playbackDevice of this.playbackDevices) {
        if (device == playbackDevice.identifier) {
          this.defaultPlaybackDevice = playbackDevice;
          return;
        }
      }
    }
  }

  setDefaultPlaybackDevice(playbackDevice: PlaybackDevice) {
    let devices = this.storedPlaybackDevices;

    let index = devices.indexOf(playbackDevice.identifier);
    if (index >= 0) {
      devices.splice(index, 1);
    }

    devices.unshift(playbackDevice.identifier);
    this.storedPlaybackDevices = devices;
    this.resolveDefaultPlaybackDevice();
  }

  ngOnDestroy() {
    if (this.playerService) {
      this.playerService.disconnect();
    }

    if (this.wampService) {
      this.wampService.disconnect();
    }
  }
}

@Injectable()
export class CanActivateAuth implements CanActivateChild, CanActivate {
  constructor(private tridentstream: Tridentstream, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    return this.canActivateChild(route, state)
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    return this.tridentstream.checkAuth().pipe(
      map(result => {
        if (!result) {
          this.router.navigate(['/login'], { queryParams: { next: state.url } })
        }
        return result;
      })
    );
  }
}
