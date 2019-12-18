import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { ListingItemResourceObject } from '../../../tridentstream/index';


@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.css']
})
export class ListingComponent implements OnInit {
  @Input() listing: Array<ListingItemResourceObject>;
  @Input() contentType: string = '';
  @Input() pathPrefix: string;
  @Input() highlightItemId: string;

  @Output() onOpen: EventEmitter<ListingItemResourceObject> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

}
