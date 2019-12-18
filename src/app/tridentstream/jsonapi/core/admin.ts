import { JSON_TYPES } from '../jsonapi';
import { ServiceResourceObject } from '../core/service';


export class AdminServiceResourceObject extends ServiceResourceObject {

}

JSON_TYPES['service_admin'] = AdminServiceResourceObject;
