import { Observable } from 'rxjs';

import { FileResourceObject, StreamResourceObject, Player } from '../jsonapi/index';
import { PlaybackDevice } from './base';

export class RemotePlayerPlaybackDevice implements PlaybackDevice {
  constructor(private player: Player) { }
    
  stream(item: FileResourceObject, viewStateId?: string): Observable<StreamResourceObject> {
    return Observable.create(observer => {
      item.stream(this.player.id, viewStateId).subscribe((doc) => {
        observer.next(null);
        observer.complete();
      }, () => observer.error());
    });
  }

  canResume() {
    return true;
  }

  isUsable() {
    return true;
  }

  getName() {
    return `Player: ${this.player.name}`;
  }

  get identifier() {
    return `remoteplayer-${this.player.id}`;
  }
}
