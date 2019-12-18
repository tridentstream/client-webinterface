import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { ListingPageComponent } from '../abstracts/listingpage/listingpage.component';

import {
  Tridentstream,
} from '../../tridentstream/index';


@Component({
  selector: 'app-sections',
  templateUrl: '../abstracts/listingpage/listingpage.component.html',
  styleUrls: ['../abstracts/listingpage/listingpage.component.css']
})
export class SectionsComponent extends ListingPageComponent {
  protected pathPrefix = 'sections';
  protected docChainType = 'service_sections';

  constructor(route: ActivatedRoute, router: Router, tridentstream: Tridentstream, titleService: Title) {
    super(route, router, tridentstream, titleService);
  }
}
