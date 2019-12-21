import { Component, OnInit, Input, Pipe, PipeTransform, ViewChild, EventEmitter, Output } from '@angular/core';

import { faPlay, faCheck, faBolt } from '@fortawesome/free-solid-svg-icons';

import * as moment from 'moment';

import { ListingItemResourceObject, DisplayMetadataResourceObject } from '../../../tridentstream/index';


@Pipe({name: 'chunk'})
export class ChunkPipe implements PipeTransform {
  transform<T>(arr: Array<T>, chunkSize: number): Array<Array<T>> {
    let totalChunks = arr.length / chunkSize;
    let retval: Array<Array<T>> = [];
    for (let i = 0; i < totalChunks; i++) {
      retval.push(arr.slice(i*chunkSize, (i+1)*chunkSize));
    }
    return retval;
  }
}

export class BaseItemComponent implements OnInit {
  @Input() item: ListingItemResourceObject;
  @Input('preferred-metadata') preferredMetadata: string;
  @Output('onStreamReady') onStreamReady$: EventEmitter<ListingItemResourceObject> = new EventEmitter();

  public metadata: DisplayMetadataResourceObject;
  public defaultMetadata: DisplayMetadataResourceObject;
  protected recentlyWatched: boolean = false;

  ngOnInit() {
    this.metadata = this.item.getMetadata(this.preferredMetadata);
    this.defaultMetadata = this.item.getDefaultMetadata();
  }

  onStreamReady() {
    this.setRecentlyWatched();
    this.onStreamReady$.emit(this.item);
  }

  setRecentlyWatched() {
    this.recentlyWatched = true;
  }

  get daysSinceWatched(): number | undefined {
    if (this.recentlyWatched)
      return 0;

    let history = this.item.getHistory();
    if (history) {
      let lastWatched = moment(history.attributes['last_watched']);
      return moment().diff(lastWatched, 'days');
    } else {
      return undefined;
    }
  }
}

@Component({
  selector: 'app-item-table',
  templateUrl: './listing.item.table.component.html',
  styleUrls: ['./listing.component.css'],
})
export class ItemTableComponent extends BaseItemComponent {
  @Input() item: ListingItemResourceObject;
  @Input('preferred-metadata') preferredMetadata: string;
  @Input('pathPrefix') pathPrefix: string;
  @Output('onStreamReady') onStreamReady$: EventEmitter<ListingItemResourceObject> = new EventEmitter();
  @Output() onOpen: EventEmitter<ListingItemResourceObject> = new EventEmitter();

  public iconPlayed = faPlay;
  public iconFinished = faCheck;
  public iconAvailable = faBolt;
}

@Component({
  selector: 'app-item-cover',
  templateUrl: './listing.item.cover.component.html',
  styleUrls: ['./listing.component.css'],
})
export class ItemCoverComponent extends BaseItemComponent {
  @Input() item: ListingItemResourceObject;
  @Input('preferred-metadata') preferredMetadata: string;
  @Input('pathPrefix') pathPrefix: string;
  @Output('onStreamReady') onStreamReady$: EventEmitter<ListingItemResourceObject> = new EventEmitter();
}

@Pipe({name: 'duration'})
export class DurationPipe implements PipeTransform {
  transform(value: number): string {
    let seconds = Math.floor(value) % 60;
    let minutes = Math.floor(value / 60) % 60;
    let hours = Math.floor(value / 60 / 60);
    if (hours) {
      return `${ hours }:${ this.pad(minutes, 2) }:${ this.pad(seconds, 2) }`;
    } else {
      return `${ this.pad(minutes, 2) }:${ this.pad(seconds, 2) }`;
    }
  }

  pad(num: number, size:number): string {
    let s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
  }
}