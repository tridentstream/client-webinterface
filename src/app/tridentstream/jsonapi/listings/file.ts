import { Observable } from 'rxjs';

import { JSON_TYPES, JsonApiDocument } from '../jsonapi';
import { ListingItemResourceObject } from './listingitem';


export class FileResourceObject extends ListingItemResourceObject {
  stream(playerId?: string, viewStateId?: string): Observable<JsonApiDocument> {
    let args = {};
    if (viewStateId)
      args['viewstate'] = viewStateId;

    if (playerId)
      args['target'] = playerId;

    return this.command('stream', {}, args);
  }
}

JSON_TYPES['file'] = FileResourceObject;
