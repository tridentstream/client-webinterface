import { Observable ,  Subject } from 'rxjs';

import { ResourceObject, JSON_TYPES, JsonApiDocument } from '../jsonapi';

export class DisplayMetadataResourceObject extends ResourceObject {
  public cover: string;
  public title: string;
  public year: number;
  public plot: string;
  public genres: Array<string>;

  public rating: number;
  public votes: number;

  public metadataPriority = 0;

  parse(obj: Object) {
    super.parse(obj);

    this.cover = this.attributes['cover'];
    if (this.cover) {
      if (this.cover.indexOf('?') > -1)
        this.cover += '&';
      else
        this.cover += '?';

      this.cover += 'resize=1';
    }

    this.title = this.attributes['title'];
    this.year = this.attributes['year'] || undefined;
    this.plot = this.attributes['plot'] || this.attributes['synopsis'] || 'No plot found';
    this.genres = this.attributes['genres'] || [];
    this.rating = parseFloat(this.attributes['rating'] || '0.0');
    this.votes = parseInt(this.attributes['votes'] || '0');

    return this;
  }

  isPopulated(): boolean {
    if (this.attributes) {
      if (this.attributes['populated'] && this.attributes['last_update_status'] != ['failed']) {
        return true;
      }
    }
    return false;
  }

  populate(): Observable<DisplayMetadataResourceObject> {
    let populated = new Subject<DisplayMetadataResourceObject>();
    let populated$ = populated.asObservable();

    this.getDocument().populate().subscribe((d) => {
      let obj = d.get(this.type, this.id);
      this.parse(obj);
      populated.next(this);
    });

    return populated$;
  }
}
