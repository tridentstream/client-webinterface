import { JSON_TYPES } from '../jsonapi';
import { DisplayMetadataResourceObject } from './metadata';


export class MalMetadataResourceObject extends DisplayMetadataResourceObject {
  public metadataPriority = 10;
  getLink(): string {
    return "https://myanimelist.net/anime/" + this.attributes['id'] + "/";
  }
}

JSON_TYPES['metadata_mal'] = MalMetadataResourceObject;
