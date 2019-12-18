import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { ListingPageComponent } from '../abstracts/listingpage/listingpage.component';

import {
  Tridentstream,
} from '../../tridentstream';


@Component({
  selector: 'app-store',
  templateUrl: '../abstracts/listingpage/listingpage.component.html',
  styleUrls: ['../abstracts/listingpage/listingpage.component.css']
})
export class StoreComponent extends ListingPageComponent {
  protected pathPrefix = 'store';
  protected docChainType = 'service_store';
  protected defaultOrdering: string = 'metadata_embedded__index';

  constructor(route: ActivatedRoute, router: Router, tridentstream: Tridentstream, titleService: Title) {
    super(route, router, tridentstream, titleService);
  }
}
