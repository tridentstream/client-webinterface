import { ResourceObject, JSON_TYPES } from '../jsonapi';

export class ServiceResourceObject extends ResourceObject {
  hasAccess(): boolean {
    for (let item of this.relationships['permission']['data']) {
      if (item['attributes']['can_access'])
        return true;
    }
    return false;
  }
}

JSON_TYPES['service_sections'] = ServiceResourceObject;
JSON_TYPES['service_store'] = ServiceResourceObject;
JSON_TYPES['service_rfs'] = ServiceResourceObject;
JSON_TYPES['service_remotesearcher'] = ServiceResourceObject;
JSON_TYPES['service_webinterface'] = ServiceResourceObject;
JSON_TYPES['service_user'] = ServiceResourceObject;
