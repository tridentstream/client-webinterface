import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';

import { forkJoin } from 'rxjs';

import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

import {
  Tridentstream,
  AdminServiceResourceObject,
  PluginResourceObject,
  PluginBaseResourceObject,
} from '../../tridentstream';

@Component({
  selector: 'app-advancedplugins',
  templateUrl: './advancedplugins.component.html',
  styleUrls: ['./advancedplugins.component.css']
})
export class AdvancedPluginsComponent implements OnInit {
  public plugins: Array<PluginResourceObject>;
  public pluginBases: Array<PluginBaseResourceObject>;

  public schema: Object;
  public uiSchema: Object;
  public formData: Object;

  public pluginName: string;
  public selectedPlugin: PluginResourceObject;
  public selectedPluginBase: PluginBaseResourceObject;

  private adminService: AdminServiceResourceObject;

  @ViewChild('addPluginModal') addPluginModal: ModalDirective;

  public loading: boolean = false;

  constructor(public toastr: ToastrService, public titleService: Title, private tridentstream: Tridentstream) { }

  ngOnInit() {
    this.titleService.setTitle('Advanced Plugins - Admin - Tridentstream');
    this.adminService = <AdminServiceResourceObject>this.tridentstream.api.getOfType('service_admin');
    if (!this.adminService) {
      return;
    }

    this.reloadPlugins();
  }

  reloadPlugins(selectPluginId: string = null) {
    this.loading = true;

    this.selectedPlugin = null;

    let pluginBase$ = this.adminService.getPluginBases();
    pluginBase$.subscribe((pluginBases) => this.pluginBases = pluginBases);

    let plugin$ = this.adminService.getPlugins();
    plugin$.subscribe((plugins) => this.plugins = plugins);

    forkJoin(pluginBase$, plugin$).subscribe(() => {
      if (selectPluginId) {
        let plugins = this.plugins.filter(p => p.id == selectPluginId);
        if (plugins) {
          this.configurePlugin(plugins[0]);
        }
      }
      this.loading = false
    });
  }

  configurePlugin(plugin: PluginResourceObject) {
    let pluginBase: PluginBaseResourceObject;
    for (let pb of this.pluginBases) {
      if (plugin.attributes['plugin_name'] == pb.attributes['plugin_name'] &&
          plugin.attributes['plugin_type'] == pb.attributes['plugin_type']) {
        pluginBase = pb;
        break;
      }
    }

    if (!pluginBase) {
      alert('Base for this plugin was not found, what happend?');
      return;
    }

    this.schema = pluginBase.attributes['schema'];
    this.uiSchema = pluginBase.attributes['ui_schema'];
    this.formData = plugin.attributes['config'];

    this.pluginName = plugin.attributes['name'];
    this.selectedPluginBase = pluginBase;
    this.selectedPlugin = plugin;

    window.scrollTo(0, 0);
  }

  showAddPluginModal() {
    this.addPluginModal.show();
  }

  addPlugin(pluginBase: PluginBaseResourceObject) {
    this.addPluginModal.hide();

    let plugin = new PluginResourceObject('plugin', null, this.adminService.getDocument());
    plugin.attributes = {
      'name': 'no-name',
      'plugin_type': pluginBase.attributes['plugin_type'],
      'plugin_name': pluginBase.attributes['plugin_name'],
    };
    this.adminService.getUrl('admin_plugin', 'plugin').subscribe((url) => {
      plugin.links['create'] = url;
      this.configurePlugin(plugin);
    });
  }

  savePlugin(plugin: PluginResourceObject, config: object, name: string) {
    this.toastr.success(`Saving plugin ${ name }`);
    plugin.attributes['config'] = config;
    plugin.attributes['name'] = name;
    plugin.create_or_update().subscribe(
      (p) => this.reloadPlugins(p.id),
      (err) => this.toastr.error(`Failed to save plugin, are you sure the name is unique?`)
    );
  }

  deletePlugin(plugin: PluginResourceObject) {
    this.toastr.success(`Deleting plugin ${ plugin.attributes['display_name'] || plugin.attributes['name'] || 'No name' }`);
    if (!!plugin.id) {
      plugin.delete().subscribe(() => this.reloadPlugins());
    } else {
      this.selectedPlugin = null;
    }
  }

  reloadAllPlugins() {
    this.toastr.success(`Reloading all plugins`);
    this.adminService.reload().subscribe();
  }

  disablePlugin(plugin: PluginResourceObject) {
    this.toastr.success(`Disabled plugin ${ plugin.attributes['display_name'] || plugin.attributes['name'] || 'No name' }`);
    plugin.attributes['enabled'] = false
    plugin.update().subscribe(() => this.reloadPlugins());
  }

  enablePlugin(plugin: PluginResourceObject) {
    this.toastr.success(`Enabled plugin ${ plugin.attributes['display_name'] || plugin.attributes['name'] || 'No name' }`);
    plugin.attributes['enabled'] = true
    plugin.update().subscribe(() => this.reloadPlugins());
  }

}
