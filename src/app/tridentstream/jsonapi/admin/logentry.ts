import { JSON_TYPES, ResourceObject } from '../jsonapi';


export class LogEntryResourceObject extends ResourceObject {
}

JSON_TYPES['logentry'] = LogEntryResourceObject;
