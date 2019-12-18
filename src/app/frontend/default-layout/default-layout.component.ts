import { Component, OnInit } from '@angular/core';

import { PlayerService } from '../shared/player/player.service';

@Component({
  selector: 'app-default-layout',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.css']
})
export class DefaultLayoutComponent implements OnInit {

  constructor(public playerService: PlayerService) { }

  ngOnInit() {
  }

}
