import { Observable } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';

import { JSON_TYPES, JsonApiDocument, ResourceObject } from '../jsonapi';
import { ServiceResourceObject } from '../core/service';
import { post } from '../../helpers';
import { PluginBaseResourceObject } from './pluginbase';
import { PluginResourceObject } from './plugin';
import { UserResourceObject } from './user';
import { PermissionResourceObject } from './permission';
import { SimpleAdminPluginResourceObject, SimpleAdminTemplateResourceObject } from './simpleadmin';
import { LogEntryResourceObject } from './logentry';


export class AdminServiceResourceObject extends ServiceResourceObject {
  getUrl(type: string, id: string): Observable<string> {
    return this.getDocument().populate().pipe(
      map((doc) => doc.get(type, id).links['self'])
    )
  }

  getGeneric<T extends ResourceObject>(type: string, id: string, query?: Object): Observable<Array<T>> {
    return this.getUrl(type, id).pipe(
      flatMap((url) => new JsonApiDocument(url, this.document.http, query).populate()),
      map((doc) => <Array<T>>(doc.data.map(o => o)))
    )

  }

  getPluginBases(): Observable<Array<PluginBaseResourceObject>> {
    return this.getGeneric('admin_plugin_base', 'plugin_base');
  }

  getPlugins(): Observable<Array<PluginResourceObject>> {
    return this.getGeneric('admin_plugin', 'plugin');
  }

  getUsers(): Observable<Array<UserResourceObject>> {
    return this.getGeneric('admin_user', 'user');
  }

  getPermissions(): Observable<Array<PermissionResourceObject>> {
    return this.getGeneric('admin_permission', 'permission');
  }

  getSimpleAdminTemplates(): Observable<Array<SimpleAdminTemplateResourceObject>> {
    return this.getGeneric('admin_simpleadmin_template', 'simpleadmin_template');
  }

  getSimpleAdminPlugins(): Observable<Array<SimpleAdminPluginResourceObject>> {
    return this.getGeneric('admin_simpleadmin_plugin', 'simpleadmin_plugin');
  }

  setSimpleAdminPluginPriorities(plugins: Array<SimpleAdminPluginResourceObject>) {
    let ids = plugins.filter(p => !!p.id).map(p => p.id);
    return this.getUrl('admin_simpleadmin_plugin_set_priorities', 'simpleadmin_plugin').pipe(
      flatMap(url => post(this.document.http, url, { priorities: ids }))
    );
  }

  reload() {
    return this.getUrl('admin_plugin_reload', 'plugin').pipe(
      flatMap((url) => post(this.document.http, url))
    )
  }

  getLogEntries(user?: UserResourceObject): Observable<Array<LogEntryResourceObject>> {
    let query = {};
    if (user) {
      query['user'] = user.id;
    }
    return this.getGeneric('admin_logentry', 'logentry', query);
  }
}

JSON_TYPES['service_admin'] = AdminServiceResourceObject;
