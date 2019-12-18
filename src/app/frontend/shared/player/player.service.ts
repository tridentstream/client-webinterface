import { Injectable } from '@angular/core';

import { Player } from '../../../tridentstream';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  public showPlayer = false;
  public player: Player;

  constructor() { }

  public setPlayer(player: Player) {
    this.player = player;
    this.showPlayer = true;
  }
}
