import { ResourceObject, JSON_TYPES } from '../jsonapi';


export class CommandResourceObject extends ResourceObject {
  execute(url: string) {

  }
}

JSON_TYPES['command'] = CommandResourceObject;
