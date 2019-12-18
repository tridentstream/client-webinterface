import { ResourceObject, JSON_TYPES } from '../jsonapi';


export class FilterInfoResourceObject extends ResourceObject {
  getMetadataHandlers(): Array<string> {
    if ('metadata_handlers' in this.attributes) {
      return <Array<string>>this.attributes['metadata_handlers'];
    } else {
      return [];
    }
  }

  hasField(field: string): boolean {
    let fields = this.attributes['filter']['fields'] || [];
    return fields.indexOf(field) >= 0;
  }

  getChoices(field: string): Array<string> {
    if (this.attributes['filter']['choices'])
      return this.attributes['filter']['choices'][field] || [];
    
    return [];
  }

  getOrderings() {
    return this.attributes['filter']['order_by'] || [];
  }
}

JSON_TYPES['metadata_filterinfo'] = FilterInfoResourceObject;
JSON_TYPES['metadata_searchfilter'] = FilterInfoResourceObject;
