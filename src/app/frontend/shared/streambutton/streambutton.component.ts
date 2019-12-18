import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { map } from 'rxjs/operators';

import { ModalDirective } from 'ngx-bootstrap';

import { faSpinner, faPlay, faTimes, faStepBackward } from '@fortawesome/free-solid-svg-icons';

import {
  Tridentstream,
  FileResourceObject,
  PlaybackDevice,
  StreamResourceObject,
  ViewState,
} from '../../../tridentstream';


@Component({
  selector: 'app-streambutton',
  templateUrl: './streambutton.component.html',
  styleUrls: ['./streambutton.component.css']
})
export class StreambuttonComponent implements OnInit {
  @Input() item: FileResourceObject;
  @Output() onStreamReady = new EventEmitter();
  public actualItem: FileResourceObject;
  public state = 'defaultaction'

  private defaultAction: PlaybackDevice;
  public action: PlaybackDevice;
  private streamResourceObject: StreamResourceObject;

  public viewState: ViewState;

  @ViewChild('resumeModal') public resumeModal: ModalDirective;

  public iconLoading = faSpinner;
  public iconPlay = faPlay;
  public iconClose = faTimes;
  public iconRestart = faStepBackward;

  constructor(public tridentstream: Tridentstream, private sanitizer: DomSanitizer) { }

  ngOnInit() {
  }

  private _doStream = (action: PlaybackDevice, viewState?: ViewState): void => {
    this.tridentstream.setDefaultPlaybackDevice(action);
    let viewStateId: string;
    if (viewState) {
      viewStateId = viewState.id;
    }


    action.stream(this.actualItem, viewStateId).subscribe((sro?: StreamResourceObject) => {
      if (sro) {
        this.streamResourceObject = sro;
        this.state = 'ready';
        this.onStreamReady.emit(sro);
      } else {
        this.state = 'loaded';
      }
    }, () => this.state = 'failed');
  }

  doResume(action: PlaybackDevice, viewState: ViewState) {
    this.resumeModal.hide();
    this._doStream(action, viewState);
  }

  doPlay(action: PlaybackDevice) {
    this.resumeModal.hide();
    this._doStream(action);
  }

  doAction(action: PlaybackDevice): void {
    this.state = 'loading';
    this.action = action;

    this.item.getDocument().populate().pipe(
      map((doc) => doc.data[0])
    ).subscribe((item: FileResourceObject) => {
      this.actualItem = item;
      let viewState = null;
      let history = item.getHistory();
      if (history != null && history.viewStates) {
        let viewStates = history.viewStates;
        if (viewStates.length > 0)
          viewState = viewStates[0];
      }

      if (action.canResume() && viewState && !viewState.isEmpty) {
        this.viewState = viewState;
        this.resumeModal.show();
      } else{
        this._doStream(action);
      }
    })
  }

}
