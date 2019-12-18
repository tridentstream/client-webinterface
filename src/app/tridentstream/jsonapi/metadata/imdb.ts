import { JSON_TYPES } from '../jsonapi';
import { DisplayMetadataResourceObject } from './metadata';


export class ImdbMetadataResourceObject extends DisplayMetadataResourceObject {
  public metadataPriority = 10;
  getLink(): string {
    return "http://www.imdb.com/title/tt" + this.attributes['id'] + "/";
  }
}

JSON_TYPES['metadata_imdb'] = ImdbMetadataResourceObject;
