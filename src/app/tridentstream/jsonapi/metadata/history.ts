import { Observable ,  Subject } from 'rxjs';

import { ResourceObject, JSON_TYPES } from '../jsonapi';

export class ViewState {
  constructor(public id: string, public created: string, public lastUpdate: string, public state: Object) { }

  get currentTime() {
    return this.state['current_time'] || 0;
  }

  get length() {
    return this.state['length'] || 0;
  }

  get isEmpty(): boolean {
    if (this.state == null)
      return true;

    let currentTime = this.currentTime;
    let length = this.length;

    if (length < 120 || currentTime < 60)
      return true;

    if ((currentTime / length) > 0.9)
      return true;

    return false;
  }
}

export class HistoryResourceObject extends ResourceObject {
  get viewStates(): Array<ViewState> {
    let viewstates = new Array<ViewState>();
    for (let vs of this.attributes['viewstates'])
      viewstates.push(new ViewState(vs['identifier'], vs['created'], vs['last_update'], vs['state']));

    viewstates.sort((a, b) => {
      if (a.lastUpdate > b.lastUpdate)
        return -1;
      else
        return 1;
    });
    return viewstates;
  }

  get date(): string {
    return this.attributes['created'].split('T')[0];
  }
}

JSON_TYPES['metadata_history'] = HistoryResourceObject;
