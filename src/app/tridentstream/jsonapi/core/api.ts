import { JSON_TYPES } from '../jsonapi';
import { ServiceResourceObject } from './service';


export class APIServiceResourceObject extends ServiceResourceObject {

}

JSON_TYPES['service_api'] = APIServiceResourceObject;
