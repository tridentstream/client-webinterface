import { Observable } from 'rxjs';

import { FileResourceObject, StreamResourceObject } from '../jsonapi/index'


export interface PlaybackDevice {
  stream(item: FileResourceObject, viewStateId?: string): Observable<StreamResourceObject>;
  isUsable(): boolean; // Should this be shown
  canResume(): boolean; // Can this one resume video playback using viewingstate
  getName(): string; // What is the name
  identifier: string; // What is the identifier
}
