import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

import {
  ListingItemResourceObject,
  JsonApiDocument,
} from '../../../tridentstream/index';


@Component({
  selector: 'app-listingbox',
  templateUrl: './listingbox.component.html',
  styleUrls: ['./listingbox.component.css']
})
export class ListingBoxComponent implements OnInit, OnChanges {
  @Input() doc: JsonApiDocument; // if it has item, use it as source
  @Input() paginateParam: string = 'page';
  @Input() highlightItemId: string;
  @Input() pathPrefix: string = '';
  @Input() itemsPerPage = 3;

  @Output('onOpen') onOpen$: EventEmitter<ListingItemResourceObject> = new EventEmitter();

  public currentPage: number = 1;
  public totalItems: number = 0;

  public listing: Array<ListingItemResourceObject>;
  public contentType = '';

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.update();
  }

  ngOnChanges() {
    this.update();
  }

  onOpen(item: ListingItemResourceObject) {
    this.onOpen$.emit(item);
  }

  update() {
    this.currentPage = parseInt(this.doc.meta['page'] || "1");
    this.totalItems = parseInt(this.doc.meta['count'] || "0");
    this.contentType = this.doc.meta['content_type'];

    let listing: Array<ListingItemResourceObject> = [];

    for (let item of this.doc.data)
      if (item instanceof ListingItemResourceObject)
        listing.push(item);

    this.listing = listing;
  }
}
