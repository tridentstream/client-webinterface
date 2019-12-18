import { JSON_TYPES, ResourceObject } from '../jsonapi';
import { post, get } from '../../helpers';
import { PluginResourceObject } from './plugin';
import { PluginBaseResourceObject } from './pluginbase';

import { map } from 'rxjs/operators';


export class SimpleAdminTemplateResourceObject extends ResourceObject {
  public pluginBase: PluginBaseResourceObject;
}

export class SimpleAdminPluginResourceObject extends ResourceObject {
  public plugin: PluginResourceObject;
  public pluginBase: PluginBaseResourceObject;
  public template: SimpleAdminTemplateResourceObject;

  inUseBy() {
    let url = this.links['self'] + 'in_use_by/';
    return get(this.document.http, url).pipe(
      map(r => <Array<Object>>(r['data']))
    );
  }
}

JSON_TYPES['simpleadmin_template'] = SimpleAdminTemplateResourceObject;
JSON_TYPES['simpleadmin_plugin'] = SimpleAdminPluginResourceObject;
