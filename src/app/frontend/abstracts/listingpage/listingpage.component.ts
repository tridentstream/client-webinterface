import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { filter, map, flatMap, mergeMap } from 'rxjs/operators';

import { faFrown } from '@fortawesome/free-regular-svg-icons';

import {
  Tridentstream,
  JsonApiDocument,
  FolderResourceObject,
  FilterInfoResourceObject,
  ListingItemResourceObject,
  FileResourceObject,
  DisplayMetadataResourceObject,
} from '../../../tridentstream/index';


export abstract class ListingPageComponent implements OnDestroy, OnInit {
  public itemsPerPage: number = 36;

  public iconSad = faFrown;

  public filterInfo: FilterInfoResourceObject;
  public contentType: string;
  public title: string;
  public parent: ListingItemResourceObject;

  public rootItem: ListingItemResourceObject;
  public rootDoc: JsonApiDocument;
  public loading = false;

  public episodeDoc: JsonApiDocument;
  public episodeLoading = false;

  public relatedListing: Array<ListingItemResourceObject>;
  public relatedLoading = false;

  protected folderId: string;
  protected queryParams: Params;

  private subParams: any;
  private subQuery: any;
  private subRootDoc: any;
  private subEpisodeDoc: any;

  public seasonParam = 'season';
  public seasonItemId: string;
  public episodeParam = 'e_page';

  constructor(private route: ActivatedRoute, private router: Router, private tridentstream: Tridentstream, private titleService: Title) { }

  ngOnInit() {
    this.subParams = this.route.params.subscribe((params: Params) => this.createDocument(params)); // create new root-item
    this.subQuery = this.route.queryParams.subscribe((params: Params) => this.updateDocuments(params)); // update root-item
  }

  updateDocuments(queryParams: Params) {
    if (queryParams == null) {
      return;
    }

    if (this.parent != null && this.queryParams != null && this.equalParams(queryParams, this.queryParams)) {
      return;
    }

    let rootQueryParams = this.getQueryParams(queryParams);

    if (this.queryParams == null || !this.equalParams(rootQueryParams, this.getQueryParams(this.queryParams))) {
      this.loading = true;

      let filterOptions = this.cleanupQueryParams(rootQueryParams);

      filterOptions['limit'] = this.itemsPerPage;
      filterOptions['page'] = filterOptions['page'] || '1';

      this.subRootDoc = this.rootItem
          .getDocument(filterOptions, false)
          .populate()
          .subscribe((doc) => {
            this.rootDoc = doc;

            this.subRootDoc = null;

            let parentInfo = doc.meta['parent'];
            this.parent = <ListingItemResourceObject>doc.get(parentInfo['type'], parentInfo['id']);
            if (!this.title) {
              this.onTitle(this.parent.attributes['display_name'] || this.parent.attributes['name']);
            }

            if (doc.meta['content_type'] == 'movies' && this.parent.type == 'file') { // TODO: file movies should be done smarter some way
              this.contentType = 'movie';
            } else {
              this.contentType = doc.meta['content_type'];
            }

            doc.meta['content_type'] = this.contentType; // TODO: additional terrible hack to handle movie

            if (this.parent.relationships['metadata_filterinfo']) {
              this.filterInfo = this.parent.relationships['metadata_filterinfo']['data'][0];
            } else if (this.parent.relationships['metadata_searchfilter']) {
              this.filterInfo = this.parent.relationships['metadata_searchfilter']['data'][0];
            } else {
              this.filterInfo = null;
            }

            this.loading = false;

            this.updateRelatedDocuments();
            this.updateEpisodeDocument();
        },
        err => this.loading = false
      );

    } else {
      this.updateEpisodeDocument();
    }
    this.queryParams = queryParams;
  }

  updateRelatedDocuments() {
    if (!this.parent)
      return;

    let displayMetadatas = this.parent.relationshipsFlat.filter((m) => m instanceof DisplayMetadataResourceObject);
    if (displayMetadatas.length == 0 || this.contentType != 'movie') {
      return;
    }

    this.relatedListing = new Array<FileResourceObject>();
    this.relatedLoading = true;

    this.tridentstream.api.resolveDocumentChain([{'type': 'service_sections'}, {'type': 'folder'}]).pipe(
      filter((ro) => ro != null),
      map((ro) => <FolderResourceObject>ro),
      filter((ro) => ro.contentType == 'movies'),
      filter((ro) => new Set(ro.filterFields).has(`${ this.parent.getBestMetadata().type }__id`)),
      flatMap((ro) => {
        let query = {};
        query[`${ this.parent.getBestMetadata().type }__id`] = this.parent.getBestMetadata().attributes['id'];
        return ro.getDocument(query).populate();
      }),
      mergeMap((doc) => doc.data),
      map((ro) => <FileResourceObject>ro),
      filter((ro) => ro.id != this.parent.id && this.relatedListing.filter(x => x.id == ro.id).length == 0)
    ).subscribe(
      (ro) => this.relatedListing.push(ro),
      () => {},
      () => this.relatedLoading = false
    );

  }

  updateEpisodeDocument() {
    if (!this.rootDoc)
      return;

    let season = this.route.snapshot.queryParams[this.seasonParam];
    if (season) {
      for (let item of this.rootDoc.data) {
        if (item instanceof ListingItemResourceObject && item.attributes['name'] == season) {
          this.seasonItemId = item.id;
          this.episodeLoading = true;
          let queryParams = this.getQueryParams(this.route.snapshot.queryParams, 'e');
          queryParams['limit'] = this.itemsPerPage;
          queryParams['page'] = queryParams["page"] || "1";
          this.subEpisodeDoc = item
              .getDocument(queryParams)
              .populate()
              .subscribe((doc) => {
                this.subEpisodeDoc = null;
                this.episodeLoading = false;
                this.episodeDoc = doc;
              });
          break;
        }
      }
    }
    this.episodeDoc = null;
  }

  createDocument(params: Params) {
    let folderId = params['sectionsId'];
    for (let i = 1; i <= 10; i++) {
      if (params['folderId' + i]) {
        folderId += '/' + params['folderId' + i];
      }
    }

    if (folderId == this.folderId) { // folder not changed, lets just skip
      return;
    }

    this.rootItem = this.tridentstream.getResourceObject('folder', folderId, folderId, FolderResourceObject); // this is the page item
    this.rootDoc = null;
    this.folderId = folderId;
    this.parent = null;
    this.queryParams = null;
    this.title = null;

    if (this.subEpisodeDoc) {
      this.subEpisodeDoc.unsubscribe();
    }

    if (this.subRootDoc) {
      this.subRootDoc.unsubscribe();
    }

    this.updateDocuments(this.route.snapshot.queryParams);
  }

  ngOnDestroy() {
    if (this.subQuery) {
      this.subQuery.unsubscribe();
    }

    if (this.subParams) {
      this.subParams.unsubscribe();
    }

    if (this.subRootDoc) {
      this.subRootDoc.unsubscribe();
    }

    if (this.subEpisodeDoc) {
      this.subEpisodeDoc.unsubscribe();
    }
  }

  getQueryParams(params: Params, prefix?: string) {
    let newObj = {}
    for (let k of Object.keys(params)) {
      if ((prefix == null && k.slice(1, 2) == '_') || (prefix != null && k.indexOf(`${ prefix }_`) != 0) || k == this.seasonParam) {
        continue;
      }

      if (prefix) {
        newObj[k.slice(2)] = params[k];
      } else {
        newObj[k] = params[k];
      }
    }

    return newObj;
  }

  cleanupQueryParams(params: object) {
    let newObj = {}
    for (let k of Object.keys(params)) {
      if (k.slice(0, 1) == '_')
        continue;

        newObj[k] = params[k];
    }
    return newObj;
  }

  equalParams(a: Params | Object, b: Params | Object) {
    const keys = Object.keys;
    for (let k of Array.from(new Set([...keys(a), ...keys(b)])))
      if (a[k] !== b[k]) return false;
    return true;
  }

  onTitle(title: string) {
    this.title = title;
    this.titleService.setTitle(`${ title } - Tridentstream`);
  }

  navigate(queryParams: Params, clearCurrent: boolean = false) {
    if (!clearCurrent) {
      queryParams = {...this.route.snapshot.queryParams, ...queryParams};
    }

    this.router.navigate([], { relativeTo: this.route, queryParams: queryParams })
  }

  selectSeasonItem(item: ListingItemResourceObject) {
    let param = {};
    param[this.episodeParam] = null;
    param[this.seasonParam] = item.attributes['name'];
    this.navigate(param);
  }
}
