import { ResourceObject, JSON_TYPES } from '../jsonapi';

export class StreamResourceObject extends ResourceObject {
}

JSON_TYPES['stream_http'] = StreamResourceObject;
