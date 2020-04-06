import { JSON_TYPES, ResourceObject } from '../jsonapi';
import { post, put } from '../../helpers';


export class ExternalPluginResourceObject extends ResourceObject {
  install() {
    let url = this.links['self'] + 'install/';
    return post(this.document.http, url);
  }
}

JSON_TYPES['externalplugin'] = ExternalPluginResourceObject;
