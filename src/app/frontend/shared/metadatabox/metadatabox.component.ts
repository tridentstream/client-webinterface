import { Component, OnInit, OnChanges, Input, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

import { tap } from 'rxjs/operators';

import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import { ListingItemResourceObject, DisplayMetadataResourceObject } from '../../../tridentstream';


@Component({
  selector: 'app-metadatabox',
  templateUrl: './metadatabox.component.html',
  styleUrls: ['./metadatabox.component.css']
})
export class MetadataBoxComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() item: ListingItemResourceObject;

  @Output() onTitle = new EventEmitter<string>();

  public metadata: DisplayMetadataResourceObject;
  public oldMetadata: DisplayMetadataResourceObject;
  public divHeight: number;
  public loading = false;

  public iconSpinner = faSpinner;

  @ViewChild('metadataBox') metadataBox: ElementRef;

  constructor() { }

  ngOnInit() {
    this.metadata = this.item.getMetadata();
    let bestMetadata = this.item.getBestMetadata();
    if (bestMetadata != null && bestMetadata != this.metadata) {
      this.loading = true;
      bestMetadata.populate().pipe(
        tap(() => this.loading = false)
      ).subscribe((metadata) => {
        if (metadata.isPopulated()) {
          this.metadata = metadata;
        }
      });
    }
  }

  ngOnChanges() {
    this.ngOnInit();
  }

  calcCoverHeight () {
    if (this.metadataBox.nativeElement.clientHeight > 0) {
      this.divHeight = this.metadataBox.nativeElement.clientHeight;
    }
  }

  ngAfterViewInit() {
    if (this.metadata.title) {
      let title = this.metadata.title;
      if (this.metadata.year) {
        title += " (" + this.metadata.year + ")";
      }

      setTimeout(() => this.onTitle.emit(title));
    }
  }
}
