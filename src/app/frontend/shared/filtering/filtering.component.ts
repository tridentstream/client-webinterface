import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { URLSearchParams } from '@angular/http';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { FilterInfoResourceObject } from '../../../tridentstream/index';


@Component({
  selector: 'app-filtering',
  templateUrl: './filtering.component.html',
  styleUrls: ['./filtering.component.css']
})
export class FilteringComponent implements OnInit, OnDestroy {
  @Input() filterInfo: FilterInfoResourceObject;

  public filter = {};
  public showAdvancedSearch = false;

  private sub;

  constructor(private route: ActivatedRoute, private router: Router) { }

  onSubmit() {
    let searchParams = {};

    for (let key in this.filter) {
      if (this.filter.hasOwnProperty(key)) {
        if (!this.filter[key]) {
          continue;
        }

        searchParams[key] = this.filter[key];
      }
    }

    let url = this.router.parseUrl(this.router.url);
    searchParams['_t'] = url.queryParams['_t'] == '1' && '2' || '1'; // bug in angular when using list arguments
    url.queryParams = searchParams;

    this.router.navigateByUrl(url);
  }

  doClear() {
    this.clearFilter();
    this.onSubmit();
  }

  clearFilter() {
    this.filter = {};
  }

  updateFilter(params: Params) {
    this.clearFilter();
    for (let k in params) {
      if (k == 'o') {
        this.filter[k] = params[k];
      }

      if (!this.filterInfo.hasField(k)) {
        continue;
      }

      this.filter[k] = params[k];
    }
    for (let k in this.filter) {
      if (k != 'q' && k != 'o') {
        this.showAdvancedSearch = true;
        break;
      }
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  ngOnInit() {
    this.sub = this.route.queryParams.subscribe((params: Params) => this.updateFilter(params));
  }

  isActive(field: string, value: string): boolean {
    let f = this.filter[field];
    if (!f) {
      return false;
    }

    if (!Array.isArray(f)) {
      f = [f];
    }

    return f.indexOf(value) >= 0;
  }

  toggle(field: string, value: string) {
    if (!this.filter[field]) {
      this.filter[field] = [];
    }

    let i = this.filter[field].indexOf(value);
    if (i >= 0) {
      this.filter[field].splice(i, 1);
    } else {
      this.filter[field].push(value)
    }
  }

  toggleAdvancedSearch() {
    this.showAdvancedSearch = !this.showAdvancedSearch;
    return false;
  }

  setField(field: string, value: {text: string, id: string}) {
    this.filter[field] = value.text;
  }
}
