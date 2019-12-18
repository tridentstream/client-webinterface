import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NgForm } from '@angular/forms';

import { of, forkJoin } from 'rxjs';
import { catchError, map, flatMap, tap } from 'rxjs/operators';

import { faCheck, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';

import {
  Tridentstream,
  AdminServiceResourceObject,
  UserResourceObject,
  PluginBaseResourceObject,
  PluginResourceObject,
  LogEntryResourceObject,
} from '../../tridentstream';


@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  private adminService: AdminServiceResourceObject;

  public iconEnabled = faCheck;
  public iconLoading = faSpinner;

  public setPasswordLoading = false;
  public setPasswordError = null;

  public userActions: Array<LogEntryResourceObject>;
  public userActionExpanded = false;

  public plugins: Array<PluginResourceObject>;
  public pluginBases: Array<PluginBaseResourceObject>;
  public users: Array<UserResourceObject>;
  public selectedUser: UserResourceObject;
  public newUser = false;
  public loadingPlugins = true;

  constructor(public titleService: Title, private toastr: ToastrService, private tridentstream: Tridentstream) { }

  ngOnInit() {
    this.titleService.setTitle('Users - Admin - Tridentstream');

    this.adminService = <AdminServiceResourceObject>this.tridentstream.api.getOfType('service_admin');
    if (!this.adminService) {
      return;
    }

    this.updateUserlist();
    this.updatePlugins();
  }

  updatePlugins() {
    forkJoin(this.adminService.getPluginBases(), this.adminService.getPlugins()).subscribe((result) => {
      let pluginBases = <Array<PluginBaseResourceObject>>result[0];
      let pluginBaseMapping = {};

      for (let pluginBase of pluginBases) {
        if (!pluginBase.attributes['default_permission'] || pluginBase.attributes['default_permission'] == 'ignore') {
          continue;
        }

        pluginBaseMapping[`${ pluginBase.attributes['plugin_type']},${ pluginBase.attributes['plugin_name']}`] = pluginBase;
      }

      this.plugins = <Array<PluginResourceObject>>result[1].filter(p => `${ p.attributes['plugin_type'] },${ p.attributes['plugin_name'] }` in pluginBaseMapping);
      this.loadingPlugins = false;
    })
  }

  updateUserlist(selectUser: UserResourceObject = null) {
    this.adminService.getUsers().subscribe((users) => {
      this.users = users;
      if (selectUser) {
        for (let user of users) {
          if (user.attributes['username'] == selectUser.attributes['username']) {
            this.configureUser(user);
            break;
          }
        }
      }
    });
  }

  public configureUser(user: UserResourceObject) {
    this.newUser = false;
    this.userActionExpanded = false;
    this.userActions = null;
    this.selectedUser = user;

    this.adminService.getLogEntries(user).subscribe((actions) => this.userActions = actions)

  }

  public addNewUser() {
    this.newUser = true;
    this.selectedUser = null;
  }

  public onAddUser(f: NgForm) {
    let user = new UserResourceObject('user', null, this.adminService.getDocument());
    user.attributes['username'] = f.value.username;
    this.adminService.getUrl('admin_user', 'user').pipe(
      map((url) => user.links['create'] = url),
      flatMap(() => user.create_or_update()),
      catchError((error: any) => of(error.error))
    ).subscribe((user) => {
      if (user['errors']) {
        this.toastr.error(`An error happened while trying to add the user: ${ user['errors'] }`, 'Failed to add')
      } else {
        this.updateUserlist(user);
      }
    });
  }

  onSetPassword(f: NgForm) {
    this.setPasswordError = null;
    this.setPasswordLoading = true;
    this.selectedUser.setPassword(f.value['password']).pipe(
      catchError((error: any) => of(error.error))
    ).subscribe(r => {
      f.reset();
      this.setPasswordLoading = false;
      if (r['errors']) {
        this.setPasswordError = r['errors']['message'];
      } else {
        this.toastr.info(`Password changed successfully for ${ this.selectedUser.attributes['username'] }`, 'Password changed')
      }
    });
  }

  onUserChanged() {
    this.selectedUser.create_or_update()
                     .subscribe((user) => this.toastr.info(`User ${ this.selectedUser.attributes['username'] } saved`));
  }

  setPermission(user: UserResourceObject, plugin: PluginResourceObject) {
    if (user.canAccess(plugin)) {
      user.revokeAccess(plugin);
    } else {
      user.grantAccess(plugin);
    }
    user.setPermissions(user.getPermissions())
        .subscribe(msg => this.toastr.info(`User ${ user.attributes['username'] } permissions updated`));
  }

}
