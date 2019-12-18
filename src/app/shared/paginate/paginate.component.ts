import { Component, OnInit, OnDestroy, OnChanges, Input, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-paginate',
  templateUrl: './paginate.component.html',
  styleUrls: ['./paginate.component.css']
})
export class PaginateComponent implements OnInit, OnDestroy, OnChanges {
  @Input() queryParam: string = 'page';
  @Input() totalItems: number;
  @Input() maxSize: number = 11;
  @Input() itemsPerPage: number = 32;

  public classMap: string;

  public currentPage: number;
  public maxPages: number;

  public pageRange: Array<{ page: number, queryParams: Object }>;
  public firstPage: Object;
  public previousPage: Object;
  public nextPage: Object;
  public lastPage: Object;
  public boundaryPreviousPage: Object;
  public boundaryNextPage: Object;

  private sub: any;

  constructor(private route: ActivatedRoute, private elementRef: ElementRef) { }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      this.classMap = this.elementRef.nativeElement.getAttribute('class') || '';
    }
    this.sub = this.route.queryParams.subscribe(p => {
      this.currentPage = parseInt(p[this.queryParam] || 1);
      this.ngOnChanges();
    });
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  ngOnChanges() {
    if (this.currentPage != null) {
      this.maxPages = Math.ceil(this.totalItems / this.itemsPerPage);

      this.firstPage = this.getPage(1);
      this.previousPage = this.getPage(this.currentPage - 1);
      this.nextPage = this.getPage(this.currentPage + 1);
      this.lastPage = this.getPage(this.maxPages);

      let pageSlice = Math.floor((this.currentPage - 1) / this.maxSize);
      let pageRange = new Array<{ page: number, queryParams: Object }>();
      for (let i = pageSlice * this.maxSize; (i < (pageSlice + 1) * this.maxSize && i < this.maxPages); i++) {
        let page = i + 1;
        pageRange.push({
          page: page,
          queryParams: this.getPage(page)
        });
      }
      this.pageRange = pageRange;

      if (this.pageRange.length > 0 && pageRange[0].page > 1) {
        this.boundaryPreviousPage = this.getPage(pageRange[0].page - 1);
      } else {
        this.boundaryPreviousPage = null;
      }

      if (this.pageRange.length > 0 && pageRange[pageRange.length - 1].page < this.maxPages) {
        this.boundaryNextPage = this.getPage(pageRange[pageRange.length - 1].page + 1);
      } else {
        this.boundaryNextPage = null;
      }
    }

  }

  replaceQueryParam(key, value) {
    let params = {...this.route.snapshot.queryParams};
    params[key] = value;
    return params;
  }

  getPage(page) {
    return this.replaceQueryParam(this.queryParam, page);
  }
}
