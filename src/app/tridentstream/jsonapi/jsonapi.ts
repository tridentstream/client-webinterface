
import { throwError as observableThrowError,  Observable,  Subject,  ReplaySubject, of } from 'rxjs';
import { flatMap, map, share, catchError, filter } from 'rxjs/operators';
import { URLSearchParams } from '@angular/http';
import { HttpClient } from '@angular/common/http';
import { post, get, put, delete_, patch } from '../helpers';
import { DELEGATE_CTOR } from '@angular/core/src/reflection/reflection_capabilities';

export var JSON_TYPES = {};

export class ResourceObject {
  public populated = false;
  public tainted = false;

  public links: { [s: string]: string } = {};
  public attributes: { [s: string]: any } = {};
  public meta: { [s: string]: any } = {};
  public relationships: { [s: string]: Object; } = {};
  public relationshipsFlat: Array<Object> = [];

  public ownDocument: JsonApiDocument;

  protected joinFields: Array<string> = [];

  constructor(public type: string, public id: string, public document?: JsonApiDocument) {
    this.roOnInit();
  }

  roOnInit() { }

  parse(obj: Object) {
    for (let item of ['attributes', 'links', 'meta']) {
      if (obj.hasOwnProperty(item)) {
        if (item === 'attributes') {
          this.populated = true;
        }

        for (let key in obj[item]) {
          this[item][key] = obj[item][key];
        }
      }
    }

    if (obj.hasOwnProperty('relationships')) {
      for (let relationshipName in obj['relationships']) {
        this.createRelationship(relationshipName, obj['relationships'][relationshipName]);
      }
    }

    return this;
  }

  responseParse(obj: Object) {
    let data = obj['data'];
    this.id = data['id'];
    this.type = data['type'];
    return this.parse(data);
  }

  createRelationship(name: string, obj: Object) {
    this.relationships[name] = {}

    if (obj.hasOwnProperty('data')) {
      this.relationships[name]['data'] = []
      for (let item of obj['data']) {
        let ro = this.document.createResourceObject(item);
        this.relationships[name]['data'].push(ro);
        this.relationshipsFlat.push(ro);
      }
    }

    if (obj.hasOwnProperty('links')) {
      this.relationships[name]['links'] = obj['links'];
    }
  }

  getDocument(query: Object = {}, keepDocument: boolean = true, link: string = 'self'): JsonApiDocument {
    for (let key of this.joinFields)
      if (query.hasOwnProperty(key) && Array.isArray(query[key])) {
        query[key] = query[key].join(',');
      }

    if (query || !keepDocument || link != 'self') {
      return new JsonApiDocument(this.links[link], this.document.http, query);
    } else {
      if (!this.ownDocument) {
        this.ownDocument = new JsonApiDocument(this.links['self'], this.document.http);
      }
      return this.ownDocument;
    }
  }

  create(url: string) {
    return post(this.document.http, url, this.attributes).pipe(
      flatMap((response) => Promise.resolve(this.responseParse(response)))
    )
  }

  update() {
    return put(this.document.http, this.links['self'], this.attributes).pipe(
      flatMap((response) => Promise.resolve(this.responseParse(response)))
    )
  }

  partialUpdate(attributes: Object) {
    return patch(this.document.http, this.links['self'], attributes).pipe(
      flatMap((response) => Promise.resolve(this.responseParse(response)))
    )
  }

  create_or_update() {
    if (this.id == null) {
      return this.create(this.links['create']);
    } else {
      return this.update();
    }
  }

  delete() {
    if (this.id != null) {
      return delete_(this.document.http, this.links['self']);
    } else {
      of(null);
    }
  }

  getRelationship(name: string) {
    if (this.relationships[name]) {
      return this.relationships[name]['data'][0];
    }
  }

}

export class JsonApiDocument {
  // data errors meta
  // links included
  public populated = false;
  public failed = false;
  public populating: Observable<JsonApiDocument>;

  public links: { [s: string]: string } = {};
  public meta: { [s: string]: any } = {};
  public relationships: { [s: string]: { [s: string]: ResourceObject; }; } = {};
  public data: Array<ResourceObject> = [];
  public included: Array<ResourceObject> = [];

  constructor(public url: string, public http: HttpClient, public query: Object = {}) { }

  createResourceObject(item: Object): ResourceObject {
    if (!this.relationships.hasOwnProperty(item['type']))
      this.relationships[item['type']] = {};

    let ro: ResourceObject;

    if (this.relationships[item['type']].hasOwnProperty(item['id'])) {
      ro = this.relationships[item['type']][item['id']];
    } else {
      let usableType: typeof ResourceObject;
      if (JSON_TYPES.hasOwnProperty(item['type'])) {
        usableType = JSON_TYPES[item['type']];
      } else {
        usableType = ResourceObject;
      }

      ro = new usableType(item['type'], item['id'], this);
    }

    if (!ro.populated && item.hasOwnProperty('attributes')) {
      ro.parse(item);
    }

    this.relationships[item['type']][item['id']] = ro;

    return ro;
  }

  getOfType(type: string): ResourceObject | void {
    let ros = this.getAllOfType(type);
    if (ros.length) {
      return ros[0];
    } else {
      return null;
    }
  }

  getAllOfType(type: string): Array<ResourceObject> {
    let ros: Array<ResourceObject> = [];
    if (this.relationships.hasOwnProperty(type)) {
      for (var key in this.relationships[type]) {
        ros.push(this.relationships[type][key]);
      }
    }

    return ros;
  }

  get(type: string, id: string): ResourceObject {
    if (this.relationships.hasOwnProperty(type) && this.relationships[type].hasOwnProperty(id)) {
      return this.relationships[type][id];
    }

    return null;
  }

  getFolderSliceId(type: string, id: string): ResourceObject {
    let ro = this.get(type, id);
    if (ro != null) {
      return ro;
    }

    let ros = this.getAllOfType(type);
    for (let ro of ros){
      if (id.indexOf(ro.id + '/') == 0) {
        return ro;
      }
    }

    return null;
  }

  parse(obj: Object) {
    if (!(obj['data'] instanceof Array)) {
      obj['data'] = [obj['data']];
    }

    for (let item of obj['data']) {
      this.data.push(this.createResourceObject(item));
    }

    for (let key in obj['meta']) {
      this.meta[key] = obj['meta'][key];
    }

    if (obj.hasOwnProperty('included')) {
      for (let item of obj['included']) {
        this.included.push(this.createResourceObject(item));
      }
    }

    return this;
  }

  populate(postBody?: Object): Observable<JsonApiDocument> {
    if (this.populated) {
      let pop = new ReplaySubject<JsonApiDocument>();
      let pop$ = pop.asObservable().pipe(share());
      pop.next(this);

      return pop$;
    } else if (this.populating) {
      return this.populating;
    } else {
      let populating: Observable<Object>;
      if (postBody == null) {
        populating = get(this.http, this.url, this.query);
      } else {
        populating = post(this.http, this.url, postBody, this.query);
      }

      this.populating = populating.pipe(
        map((response: Object) => this.parse(response)),
        catchError(err => observableThrowError('failed to populate')),
        share()
      )

      this.populating.subscribe(
        () => this.populated = true,
        () => {
          this.populated = true;
          this.failed = true;
      });

      return this.populating;
    }
  }

  resolveDocumentChain(docs: Array<{type: string, id?: string, folderSliceId?: boolean}>): Observable<ResourceObject | void> {
    let docsCopy = docs.slice();
    return Observable.create(observer => {
      this.populate().subscribe(() => {
        let docInfo = docsCopy.shift();
        let ros: Array<ResourceObject>;
        if (docInfo.folderSliceId) {
          ros = [this.getFolderSliceId(docInfo.type, docInfo.id)];
        } else if (docInfo.id) {
          ros = [this.get(docInfo.type, docInfo.id)];
        } else {
          ros = this.getAllOfType(docInfo.type);
        }

        ros = ros.filter((ro) => ro != null);

        let callRecursive = false;
        for (let ro of ros) {
          if (docsCopy.length > 0) {
            ro.getDocument().resolveDocumentChain(docsCopy).pipe(
              catchError(err => of(null)),
              filter(ro => ro != null)
            ).subscribe((ro) => observer.next(ro), () => {}, () => observer.complete());
            callRecursive = true;
          } else if (docInfo.folderSliceId && ro.id != docInfo.id) {
            ro.getDocument().resolveDocumentChain([docInfo]).pipe(
              catchError(err => of(null)),
              filter(ro => ro != null)
            ).subscribe((ro) => observer.next(ro), () => {}, () => observer.complete());
            callRecursive = true;
          } else {
            observer.next(ro);
          }
        }

        if (!callRecursive) {
          observer.complete();
        }
      },);
    })
  }
}
