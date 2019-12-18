import { JSON_TYPES } from '../jsonapi';
import { DisplayMetadataResourceObject } from './metadata';


export class EmbeddedMetadataResourceObject extends DisplayMetadataResourceObject {
    public metadataPriority = -10;

}

JSON_TYPES['metadata_embedded'] = EmbeddedMetadataResourceObject;
