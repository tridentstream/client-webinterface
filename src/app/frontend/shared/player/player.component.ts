import { Component, OnInit, Input, Pipe, PipeTransform } from '@angular/core';

import { timer, Subscription } from 'rxjs';

import { faFastForward, faForward, faBackward, faPlay, faStop, faFastBackward, faPause, faTimes } from '@fortawesome/free-solid-svg-icons';

import { Player } from '../../../tridentstream';
import { PlayerService } from '../../shared/player/player.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit {
  public player: Player;

  public iconPrevious = faFastBackward;
  public iconBackward = faBackward;
  public iconStop = faStop;
  public iconPause = faPause;
  public iconPlay = faPlay;
  public iconForward = faForward;
  public iconNext = faFastForward;

  public iconHide = faTimes;

  protected playbackTimer: Subscription;
  public currentTime$: number;

  public tooltipTime: number;
  public showTooltipTime = false;

  constructor(public playerService: PlayerService) { }

  ngOnInit() {
    this.player = this.playerService.player;
    let sourceValue = null;
    let tickTime = 250;
    this.playbackTimer = timer(0, tickTime).subscribe(tick => {
      if (this.player == null || this.player.values.get('current_time') == null)
        return;

      if (this.player.values.get('current_time') != sourceValue) {
        this.currentTime$ = this.player.values.get('current_time');
        sourceValue = this.player.values.get('current_time');
      } else {
        this.currentTime$ += (tickTime * this.player.values.get('speed')) / 1000;
      }
    });
  }

  ngOnDestroy() {
    this.playbackTimer.unsubscribe();
  }

  close() {
    this.playerService.showPlayer = false;
    return false;
  }

  changeSpeed(change: number) {
    let currentSpeed = this.player.values.get('speed');
    let speeds = this.player.options['speed'];
    let index = speeds.indexOf(currentSpeed) + change;
    if (index <= 0 || index >= speeds.length)
      return;

    this.setValue('speed', speeds[index]);
  }

  changeState(state: string) {
    this.player.requestState(state, {});
  }

  command(command: string, args: Array<any> = []) {
    this.player.command(command, args);
  }

  getTimeFromEvent($event: MouseEvent) {
    let seekBarElement = $event.target;
    while (seekBarElement['localName'] != 'progressbar') {
      seekBarElement = seekBarElement['parentElement'];
    }
    let width = seekBarElement['offsetWidth'];
    let clickWidth = $event.offsetX;
    let seekTime = (clickWidth / width) * this.totalTime;
    return seekTime;
  }

  setTooltipTime($event: MouseEvent) {
    this.tooltipTime = this.getTimeFromEvent($event);
  }

  seek($event: MouseEvent) {
    this.setValue('current_time', this.getTimeFromEvent($event));
  }

  setValue(key: string, value: any) {
    this.player.values.set(key, value);
    let obj = {};
    obj[key] = value;
    this.player.requestState(this.player.state, obj);
  }

  get audioTracks() {
    return this.player.values.get('audiostreams');
  }

  get currentAudioTrack() {
    let value = this.player.values.get('current_audiostream');
    if (value != null) {
      return value;
    } else {
      return null;
    }
  }

  set currentAudioTrack(track: any) {
    this.setValue('current_audiostream', track);
  }

  get subtitleTracks() {
    return this.player.values.get('subtitles');
  }

  get currentSubtitleTrack() {
    let value = this.player.values.get('current_subtitle');
    if (value != null) {
      return value;
    } else {
      return -1;
    }
  }

  set currentSubtitleTrack(track: any) {
    this.setValue('current_subtitle', track);
  }

  get currentTime() {
    return this.currentTime$ || this.player.values.get('current_time');
  }

  get totalTime() {
    return this.player.values.get('length') || 0;
  }

}


@Pipe({name: 'secondsToTimestamp'})
export class SecondsToTimestampPipe implements PipeTransform {
  transform(value: number): string {
    let hours = Math.floor(value / 60 / 60);
    let minutes = Math.floor(value / 60) % 60;
    let seconds = Math.floor(value) % 60;

    let result = `${ minutes < 10 && '0' + minutes || minutes }:${ seconds < 10 && '0' + seconds || seconds }`;

    if (hours)
      result = `${ hours }:${ result }`;

    return result
  }
}