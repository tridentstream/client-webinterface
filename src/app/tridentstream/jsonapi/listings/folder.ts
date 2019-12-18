import { JSON_TYPES } from '../jsonapi';
import { ListingItemResourceObject } from './listingitem';


export class FolderResourceObject extends ListingItemResourceObject {
    protected joinFields: Array<string> = ['o'];

    get contentType() {
        let filterInfos = this.relationships['metadata_filterinfo'];
        if (filterInfos) {
            let filterInfo = filterInfos['data'][0];
            return filterInfo.attributes['content_type'] || null;
        }
        return null;
    }

    get metadataHandlers() {
        let filterInfos = this.relationships['metadata_filterinfo'];
        if (filterInfos) {
            let filterInfo = filterInfos['data'][0];
            return filterInfo.attributes['metadata_handlers'] || [];
        }
        return [];
    }

    get filterFields() {
        let filterInfos = this.relationships['metadata_filterinfo'];
        if (filterInfos) {
            let filterInfo = filterInfos['data'][0];
            return filterInfo.attributes['filter']['fields'];
        }
        return [];
    }
}

JSON_TYPES['folder'] = FolderResourceObject;
