import { EventEmitter } from '@angular/core';

import { JSON_TYPES } from '../jsonapi';
import { ServiceResourceObject } from './service';
import { StreamResourceObject } from './stream';
import { JSONRPCWebSocket } from '../../websocket';

interface PlayerStateUpdate {
  player_id: string,
  values: {},
  state?: string,
  name?: string,
  commands?: string[],
  options?: {}
}

export class PlayerServiceResourceObject extends ServiceResourceObject {
  public players = new Map<string, Player>();
  public ws: JSONRPCWebSocket;
  public onPlayerChange: EventEmitter<any> = new EventEmitter();

  connect() {
    this.ws = new JSONRPCWebSocket();
    this.ws.connect(this.links['self']);
    this.ws.onConnected$.subscribe(() => this.registerEvents());
    this.ws.onDisconnected$.subscribe(() => {
      this.players.clear();
      this.onPlayerChange.emit(null);
    });
  }

  disconnect() {
    if (!this.ws)
      return;

    this.ws.close();
  }

  get connected(): boolean {
    return this.ws.connected;
  }

  updatePlayerState(playerState: PlayerStateUpdate) {
    let playerId = playerState.player_id;

    if (!this.players.has(playerId)) {
      this.players.set(playerId, new Player(this, playerId, playerState.name, playerState.commands, playerState.options));
      this.onPlayerChange.emit(null);
    }

    let player = this.players.get(playerId);
    if (player.state != playerState.state) {
      player.setState(playerState.state, playerState.values);
    } else {
      player.updateState(playerState.values);
    }
  }

  removePlayer(playerId: string) {
    if (this.players.has(playerId)) {
      this.players.delete(playerId);
      this.onPlayerChange.emit(null);
    }
  }

  registerEvents() {
    console.log('Registering events');
    this.ws.call('subscribe');

    this.ws.getCommandObservable('update').subscribe((playerStates: Array<PlayerStateUpdate>) => {
      console.log('Player update', playerStates);
      playerStates.forEach((playerState) => this.updatePlayerState(playerState));
    });

    this.ws.getCommandObservable('disconnected').subscribe((playerStates: Array<{player_id: string}>) => {
      console.log('Player disconnect', playerStates);
      playerStates.forEach((playerState) => this.removePlayer(playerState.player_id));
    });
  }

  getPlayers(): Array<Player> {
    let players = Array<Player>();
    this.players.forEach((value, key) => {
      players.push(value);
    })
    return players;
  }
}

export class Player {
  public values = new Map<string, any>();
  public state = 'unknown';
  constructor(private playerService: PlayerServiceResourceObject, public id: string, public name: string, public commands: Array<string>, public options: {}) { }

  setState(state: string, values: {}): void {
    this.state = state;
    this.values.clear();
    this.updateState(values);
  }

  updateState(values: {}): void {
    for (let key of Object.keys(values)) {
      this.values.set(key, values[key]);
    }
  }

  requestState(state: string, value: Object) {
    console.log('Requesting state from', this.id, state, value);
    this.callCommand('request_state', [this.id, state, value]);
  }

  callCommand(command: string, args: Array<any> = []) {
    this.playerService.ws.call(command, args);
  }

  command(method: string, args: Array<any> = []) {
    let newArgs = args.slice();
    newArgs.unshift(method);
    newArgs.unshift(this.id);
    this.callCommand('command', newArgs);
  }

  get isPlaying() {
    return this.state == 'playing';
  }
}


JSON_TYPES['service_player'] = PlayerServiceResourceObject;
