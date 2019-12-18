import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { faWindowMaximize, faArrowsAlt } from '@fortawesome/free-solid-svg-icons';
import { ToastrService } from 'ngx-toastr';

import {
  Tridentstream,
  AdminServiceResourceObject,
  PluginResourceObject,
  PluginBaseResourceObject,
  SimpleAdminPluginResourceObject,
  SimpleAdminTemplateResourceObject,
} from '../../tridentstream';


@Component({
  selector: 'app-simpleadmin-plugin',
  templateUrl: './plugins.simpleadmin.plugin.component.html'
})
export class SimpleAdminPluginComponent implements OnInit {
  @Input() plugin: SimpleAdminPluginResourceObject;
  @Input() hideSections = false;
  @Input() showPluginType = false;
  @Input() showPluginName = false;
  @Input() initialExpanded = false;

  @Output() savePlugin = new EventEmitter<SimpleAdminPluginResourceObject>();
  @Output() deletePlugin = new EventEmitter<null>();

  public iconExpand = faWindowMaximize;
  public iconDraggable = faArrowsAlt;
  public expanded = false;

  public uiSchema: Object;
  public schema: Object;

  constructor(public toastr: ToastrService) { }

  ngOnInit() {
    this.schema = this.plugin.template.attributes['schema'];
    let uiSchema = Object.assign({}, this.plugin.template.attributes['ui_schema']);

    if (this.hideSections) {
      uiSchema['sections'] = Object.assign({}, uiSchema['sections'] || {});
      uiSchema['sections']['classNames'] = uiSchema['sections']['classNames'] || '';
      uiSchema['sections']['classNames'] += ' d-none';
    }

    this.uiSchema = uiSchema;

    if (this.initialExpanded) {
      this.expanded = true;
    }
  }

  expandPlugin() {
    this.expanded = !this.expanded;
    return false;
  }
}
