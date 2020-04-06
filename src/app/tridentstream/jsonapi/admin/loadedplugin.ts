import { JSON_TYPES, ResourceObject } from '../jsonapi';
import { post, put } from '../../helpers';


export class LoadedPluginResourceObject extends ResourceObject {
  uninstall() {
    let url = this.links['self'] + 'uninstall/';
    return post(this.document.http, url);
  }
}

JSON_TYPES['loadedplugin'] = LoadedPluginResourceObject;
