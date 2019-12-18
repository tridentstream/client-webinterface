import { Component, OnInit, Input } from '@angular/core';

import {
  PluginResourceObject,
  PluginBaseResourceObject,
} from '../../tridentstream';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-plugin-commands',
  templateUrl: './plugins.commands.component.html'
})
export class PluginCommandsComponent implements OnInit {
  @Input() plugin: PluginResourceObject;
  @Input() pluginBase: PluginBaseResourceObject;

  constructor(public toastr: ToastrService) { }

  ngOnInit() { }

  executeCommand(command: Object) {
    this.toastr.info(`Executing '${ command['display_name'] }' on '${ this.plugin.attributes['plugin_name'] }'`)
    return this.plugin.runCommand(command, {});
  }
}
