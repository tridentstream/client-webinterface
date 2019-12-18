import { post, get } from '../../helpers';
import { JSON_TYPES } from '../jsonapi';
import { ServiceResourceObject } from './service';

import { map } from 'rxjs/operators';


export class ConfigServiceResourceObject extends ServiceResourceObject {
  getSetting(namespace: string, key: string) {
    return this.getDocument({namespace: namespace, key: key}, false).populate().pipe(
      map(doc => doc.data.length && doc.data[0]['attributes']['value'] || null)
    )
  }

  setSetting(namespace: string, key: string, value: Object) {
    return this.getDocument({namespace: namespace, key: key}, false).populate(value).pipe(
      map(doc => doc.data.length && doc.data[0]['attributes']['value'] || null)
    )
  }
}

JSON_TYPES['service_config'] = ConfigServiceResourceObject;
