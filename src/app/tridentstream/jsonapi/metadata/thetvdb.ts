import { JSON_TYPES } from '../jsonapi';
import { DisplayMetadataResourceObject } from './metadata';


export class TheTVDBMetadataResourceObject extends DisplayMetadataResourceObject {
  public metadataPriority = 10;
  getLink(): string {
    return "http://thetvdb.com/?tab=series&id=" + this.attributes['id'] + "/";
  }
}

JSON_TYPES['metadata_thetvdb'] = TheTVDBMetadataResourceObject;
