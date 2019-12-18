import { Component, OnInit } from '@angular/core';

import { faDotCircle, faUser } from '@fortawesome/free-regular-svg-icons';

import { PlayerService } from '../shared/player/player.service';


import {
  Tridentstream,
  JsonApiDocument,
  FolderResourceObject,
  ServiceResourceObject,
  Player
} from '../../tridentstream/index';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  public listingServices: Array<{name: string, entries: Array<FolderResourceObject>, url: string, id: string}> = [];
  public configServices: Array<{name: string, url: string}> = [];
  public isCollapsed = true;

  public playerIcon = faDotCircle;
  public userIcon = faUser;

  constructor(public tridentstream: Tridentstream, public player: PlayerService) { }

  ngOnInit() {
    this.configServices = [];
    this.listingServices = [];
    let types = [
      {type: 'service_sections', url: 'sections', navbarType: 'listingService'},
      {type: 'service_store', url: 'store', navbarType: 'listingService'},
      {type: 'service_admin', url: 'admin', navbarType: 'config', displayName: 'Admin'},
    ];

    for (let type of types) {
      let ros = <Array<ServiceResourceObject>>this.tridentstream.api.getAllOfType(type['type']);
      for (let ro of ros) {
        if (!ro.hasAccess())
          continue;

        if (type.navbarType == 'listingService') {
          let docs: Array<FolderResourceObject> = [];
          this.listingServices.push({name: ro.attributes['display_name'], entries: docs, url: type.url, id: ro.id});
          ro.getDocument().populate().subscribe((doc) => {
            for (let entry of doc.data)
              docs.push(<FolderResourceObject>entry);
          });
        } else if (type.navbarType == 'config') {
          this.configServices.push({
            name: type['displayName'],
            url: type.url,
          })
        }
      }
    }
  }

  showPlayer(player: Player) {
    console.log(this.player);
    this.player.setPlayer(player);
    return false;
  }

}
