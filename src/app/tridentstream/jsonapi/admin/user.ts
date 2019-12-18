import { PluginResourceObject } from './plugin';
import { JSON_TYPES, ResourceObject } from '../jsonapi';
import { post } from '../../helpers';


export class UserResourceObject extends ResourceObject {
  public permissionsModified: boolean = false;

  setPassword(password: string) {
    let url = this.links['self'] + 'set_password/';
    let payload = {
      password: password,
    }
    return post(this.document.http, url, payload);
  }

  setPermissions(permissions: Array<string>) {
    let url = this.links['self'] + 'set_permissions/';
    let payload = {
      permissions: permissions,
    }
    return post(this.document.http, url, payload);
  }

  canAccess(plugin: PluginResourceObject): boolean {
    let permission = plugin.getPermission();
    return this.attributes['permissions'].indexOf(permission) >= 0;
  }

  grantAccess(plugin: PluginResourceObject) {
    let permission = plugin.getPermission();
    this.attributes['permissions'].push(permission);
    this.permissionsModified = true;
  }

  revokeAccess(plugin: PluginResourceObject) {
    let permission = plugin.getPermission();
    let index = this.attributes['permissions'].indexOf(permission);
    this.attributes['permissions'].splice(index, 1);
    this.permissionsModified = true;
  }

  getPermissions() {
    return this.attributes['permissions'];
  }
}

JSON_TYPES['user'] = UserResourceObject;
