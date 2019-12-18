import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ResourceObject, JSON_TYPES } from '../jsonapi';
import { post, get } from '../../helpers';

export class UserInfoResourceObject extends ResourceObject {
  login(username: string, password: string): Observable<boolean> {
    return post(this.document.http, this.links['auth'], {'username': username, 'password': password}).pipe(
      map((response: Object): boolean => response['status'] === 'success')
    );
  }

  logout(): Observable<void> {
    return get(this.document.http, this.links['logout']).pipe(
      map(r => null)
    );
  }
}

JSON_TYPES['userinfo'] = UserInfoResourceObject;
