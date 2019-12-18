import { Observable } from 'rxjs';

import { FileResourceObject, StreamResourceObject } from '../jsonapi/index';
import { PlaybackDevice } from './base';

export class DownloadPlaybackDevice implements PlaybackDevice {
  public identifier = 'download';
  stream(item: FileResourceObject, viewStateId?: string): Observable<StreamResourceObject> {
    return Observable.create(observer => {
      item.stream().subscribe((doc) => {
        for (let ro of doc.data) {
          if (ro instanceof StreamResourceObject) {
            observer.next(ro);
            observer.complete();
            return;
          }
        }
        
        observer.error();
      }, () => observer.error());
    });
  }

  canResume() {
    return false;
  }

  isUsable() {
    return true;
  }

  getName() {
    return 'Download';
  }
}
