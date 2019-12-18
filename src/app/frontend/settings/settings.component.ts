import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';

import {
  Tridentstream,
  UserInfoResourceObject,
  ServiceResourceObject,
} from '../../tridentstream';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  public tokenShown = false;
  public userInfo: UserInfoResourceObject;
  public externalServices: Array<ServiceResourceObject>;
  private externalServiceTypes = ['service_rfs', 'service_remotesearcher'];

  constructor(public tridentstream: Tridentstream, public titleService: Title) { }

  ngOnInit() {
    this.titleService.setTitle('Settings - Tridentstream');

    this.userInfo = this.tridentstream.userInfo;

    let services = this.tridentstream.api.data
        .filter((ro) => (ro instanceof ServiceResourceObject));

    this.externalServices = services
        .filter((ro) => this.externalServiceTypes.indexOf(ro.type) >= 0)
        .map((ro) => <ServiceResourceObject>ro)
        .filter((ro) => ro.hasAccess());
  }

  showToken() {
    this.tokenShown = true;
    return false;
  }

}
