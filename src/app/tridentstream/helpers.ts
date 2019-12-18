import { URLSearchParams } from '@angular/http';
import { HttpClient, HttpHeaders,  HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';


function getSearchParams(url: string, urlArgs = {}):  HttpParams {
  let urlSplit = url.split('?');
  let search = "";
  if (urlSplit.length > 1)
    search = urlSplit[1];

  let searchParams = new HttpParams({fromString: search});

  for (let key in urlArgs) {
    if (urlArgs.hasOwnProperty(key)) {
      let values;
      if (urlArgs[key] instanceof Array)
        values = urlArgs[key];
      else
        values = [urlArgs[key]];

      for (let value of values) {
        searchParams = searchParams.set(key, value);
      }

    }
  }

  return searchParams;
}

export function post(http: HttpClient, url: string, postBody: Object = {}, search = {}): Observable<Object> {
  let body = JSON.stringify(postBody);
  let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': '*/*' });
  let options = { headers: headers, params: getSearchParams(url, search), 'withCredentials': true };

  return http.post(url, body, options);
}

export function put(http: HttpClient, url: string, postBody: Object = {}, search = {}): Observable<Object> {
  let body = JSON.stringify(postBody);
  let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': '*/*' });
  let options = { headers: headers, params: getSearchParams(url, search), 'withCredentials': true };

  return http.put(url, body, options);
}

export function get(http: HttpClient, url: string, search = {}): Observable<Object> {
  let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': '*/*' });
  let options = { headers: headers, params: getSearchParams(url, search), 'withCredentials': true };

  return http.get(url, options);
}

export function delete_(http: HttpClient, url: string, search = {}): Observable<Object> {
  let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': '*/*' });
  let options = { headers: headers, params: getSearchParams(url, search), 'withCredentials': true };

  return http.delete(url, options);
}

export function patch(http: HttpClient, url: string, postBody: Object = {}, search = {}): Observable<Object> {
  let body = JSON.stringify(postBody);
  let headers = new HttpHeaders({ 'Content-Type': 'application/json', 'Accept': '*/*' });
  let options = { headers: headers, params: getSearchParams(url, search), 'withCredentials': true };

  return http.patch(url, body, options);
}