import { JSON_TYPES, ResourceObject } from '../jsonapi';
import { post, put } from '../../helpers';


export class PluginResourceObject extends ResourceObject {
  runCommand(command: Object, args: Object): void {
    let url = this.links['self'] + 'command/';
    let payload = {
      command: command['command'],
      kwargs: args,
    }
    post(this.document.http, url, payload).subscribe((result) => {
      console.log(result);
    });
  }

  getPermission(): string {
    return `${ this.attributes['plugin_type'] }.${ this.attributes['name'] }`;
  }

  setDisplayName(name: string) {
    let url = this.links['self'] + 'set_display_name/';
    return post(this.document.http, url, {display_name: name});
  }

  reload() {
    let url = this.links['self'] + 'reload/';
    return post(this.document.http, url);
  }
}

JSON_TYPES['plugin'] = PluginResourceObject;
