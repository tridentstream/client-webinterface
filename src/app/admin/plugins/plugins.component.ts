import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

import { forkJoin } from 'rxjs';

import { ModalDirective } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { faArrowsAlt } from '@fortawesome/free-solid-svg-icons';

import {
  Tridentstream,
  AdminServiceResourceObject,
  PluginResourceObject,
  PluginBaseResourceObject,
  ServiceResourceObject,
  SimpleAdminPluginResourceObject,
  SimpleAdminTemplateResourceObject,
} from '../../tridentstream';

interface Section {
  sections: Array<SimpleAdminPluginResourceObject>,
  plugin: PluginResourceObject,
}

@Component({
  selector: 'app-plugins',
  templateUrl: './plugins.component.html',
  styleUrls: ['./plugins.component.css']
})
export class PluginsComponent implements OnInit {
  public plugins: Array<PluginResourceObject>;
  public pluginBases: Array<PluginBaseResourceObject>;
  public simpleAdminPlugins: Array<SimpleAdminPluginResourceObject>;
  public simpleAdminTemplates: Array<SimpleAdminTemplateResourceObject>;

  public modalTemplates: Array<SimpleAdminTemplateResourceObject>;
  public modalFilteredOn: Array<String>;
  public modalSection: Section;
  public modalArray: Array<SimpleAdminPluginResourceObject>;

  public sections: Array<Section>;
  public stores: Array<Section>;

  public inputs: Array<SimpleAdminPluginResourceObject>;
  public allInputs: Array<PluginResourceObject>;
  public searchers: Array<SimpleAdminPluginResourceObject>;
  public allSearchers: Array<PluginResourceObject>;

  public remotefilesystems: Array<PluginResourceObject>;
  public remotesearchers: Array<PluginResourceObject>;

  public others: Array<SimpleAdminPluginResourceObject>;
  public othersPluginType = ['metadatahandler', 'bittorrentclient', 'magnetresolver'];

  private adminService: AdminServiceResourceObject;

  public iconDraggable = faArrowsAlt;

  @ViewChild('addPluginModal') addPluginModal: ModalDirective;

  public loading: boolean = false;

  constructor(public toastr: ToastrService, public titleService: Title, private tridentstream: Tridentstream) { }

  ngOnInit() {
    this.titleService.setTitle('Plugins - Admin - Tridentstream');
    this.adminService = <AdminServiceResourceObject>this.tridentstream.api.getOfType('service_admin');
    if (!this.adminService) {
      return;
    }

    this.addPluginModal.onHidden.subscribe(m => this.modalSection = null);

    this.reloadPlugins();
  }

  reloadPlugins() {
    this.loading = true;

    let simpleAdminTemplates$ = this.adminService.getSimpleAdminTemplates();
    let simpleAdminPlugins$ = this.adminService.getSimpleAdminPlugins();

    let pluginBase$ = this.adminService.getPluginBases();
    pluginBase$.subscribe((pluginBases) => this.pluginBases = pluginBases);

    let plugin$ = this.adminService.getPlugins();
    plugin$.subscribe((plugins) => this.plugins = plugins);

    forkJoin(pluginBase$, plugin$, simpleAdminPlugins$, simpleAdminTemplates$).subscribe(results => {
      let pluginBases = results[0];
      let plugins = results[1];
      let simpleAdminPlugins = results[2];
      let simpleAdminTemplates = results[3];

      this.remotefilesystems = plugins.filter(p => p.attributes['plugin_type'] == 'service' && p.attributes['plugin_name'] == 'rfs');
      this.remotesearchers = plugins.filter(p => p.attributes['plugin_type'] == 'service' && p.attributes['plugin_name'] == 'remotesearcher');

      for (let template of simpleAdminTemplates) {
        for (let pluginBase of pluginBases) {
          if (template.attributes['plugin_name'] == pluginBase.attributes['plugin_name'] && template.attributes['plugin_type'] == pluginBase.attributes['plugin_type']) {
            template.pluginBase = pluginBase;
            break;
          }
        }
      }
      this.simpleAdminTemplates = simpleAdminTemplates;

      for (let managed of simpleAdminPlugins) {
        for (let pluginBase of pluginBases) {
          if (managed.attributes['plugin_name'] == pluginBase.attributes['plugin_name'] && managed.attributes['plugin_type'] == pluginBase.attributes['plugin_type']) {
            managed.pluginBase = pluginBase;
            break;
          }
        }

        for (let plugin of plugins) {
          if (managed.attributes['plugin_id'].toString() == plugin.id) {
            managed.plugin = plugin;
            break;
          }
        }

        for (let template of simpleAdminTemplates) {
          if (managed.attributes['template_id'].toString() == template.id) {
            managed.template = template;
            break;
          }
        }
      }
      this.simpleAdminPlugins = simpleAdminPlugins;

      this.others = simpleAdminPlugins.filter(p => this.othersPluginType.indexOf(p.attributes['plugin_type']) >= 0);

      this.sections = new Array();
      this.stores = new Array();

      for (let plugin of plugins) {
        if (plugin.attributes['plugin_type'] == 'service' && ['sections', 'store'].includes(plugin.attributes['plugin_name'])) {
          let p = {
            plugin: plugin,
            sections: simpleAdminPlugins.filter(x => x.plugin == plugin),
          };

          if (plugin.attributes['plugin_name'] == 'sections') {
            this.sections.push(p);
          }

          if (plugin.attributes['plugin_name'] == 'store') {
            this.stores.push(p);
          }
        }
      }

      this.inputs = simpleAdminPlugins.filter(x => x.attributes['plugin_type'] == 'input');
      this.allInputs = plugins.filter(x => x.attributes['plugin_type'] == 'input');
      this.searchers = simpleAdminPlugins.filter(x => x.attributes['plugin_type'] == 'searcher');
      this.allSearchers = plugins.filter(x => x.attributes['plugin_type'] == 'searcher');

      this.loading = false;
    });
  }

  moveSectionItem(event: CdkDragDrop<any>, section: { sections: Array<SimpleAdminPluginResourceObject> }) {
    moveItemInArray(section.sections, event.previousIndex, event.currentIndex);
    this.adminService.setSimpleAdminPluginPriorities(section.sections).subscribe();
  }

  addSimplePluginTemplate(template: SimpleAdminTemplateResourceObject) {
    this.addPluginModal.hide();
    this.toastr.success(`Added new plugin from template ${ template.attributes['display_name'] }`);
    this.adminService.getUrl('admin_simpleadmin_plugin', 'simpleadmin_plugin').subscribe((url) => {
      let simpleAdminPlugin = new SimpleAdminPluginResourceObject('simpleadmin_plugin', null, this.adminService.getDocument());
      simpleAdminPlugin.attributes = {
        'display_name': '',
        'plugin_type': template.attributes['plugin_type'],
        'plugin_name': template.attributes['plugin_name'],
        'config': {'display_name': ''},
        'template_id': template.id,
      };

      simpleAdminPlugin.template = template;
      simpleAdminPlugin.pluginBase = template.pluginBase;
      simpleAdminPlugin.links['create'] = url;

      if (this.modalSection) {
        simpleAdminPlugin.attributes.config['sections'] = parseInt(this.modalSection.plugin.id);
        this.modalSection.sections.unshift(simpleAdminPlugin);
      }

      if (this.modalArray) {
        this.modalArray.unshift(simpleAdminPlugin);
      }
    });
  }

  showSimpleAdminPluginModal(section: Section | null, array: Array<SimpleAdminPluginResourceObject>, pluginType: string | Array<string> | null, pluginName: string | null) {
    this.modalTemplates = this.simpleAdminTemplates
      .filter(p => !pluginType || p.attributes['plugin_type'] == pluginType || (pluginType instanceof Array && pluginType.indexOf(p.attributes['plugin_type']) >= 0))
      .filter(p => !pluginName || p.attributes['plugin_name'] == pluginName);

    this.modalSection = section;
    this.modalArray = array;

    this.modalFilteredOn = [];
    if (pluginType) {
      this.modalFilteredOn.push('plugin_type');
    }
    if (pluginName) {
      this.modalFilteredOn.push('plugin_name');
    }

    this.addPluginModal.show();
  }

  saveSectionPlugin(section: Section, oldPlugin: SimpleAdminPluginResourceObject, config: object) {
    this.toastr.success(`Saving plugin ${ config['display_name'] || config['name'] }`);
    oldPlugin.attributes['config'] = config;
    oldPlugin.create_or_update().subscribe((newPlugin) => {
      let index = section.sections.indexOf(oldPlugin);
      section.sections[index] = newPlugin;
      this.adminService.setSimpleAdminPluginPriorities(section.sections).subscribe();
    },
    err => {
      let errors = [];
      for (let k in err.error.errors) {
        errors.push(`${ k }: ${ err.error.errors[k].join(' / ') }`);
      }
      this.toastr.error(`Failed to save plugin<br />${ errors.join('<br />') }`, '', { enableHtml: true });
    });
  }

  deleteSectionPlugin(section: Section, plugin: SimpleAdminPluginResourceObject) {
    this.toastr.success(`Deleting plugin ${ plugin.attributes['display_name'] || plugin.attributes['name'] }`);
    let index = section.sections.indexOf(plugin);
    section.sections.splice(index, 1);
    if (plugin.id) {
      plugin.delete().subscribe();
    }
  }

  savePlugin(plugin: SimpleAdminPluginResourceObject, config: object) {
    this.toastr.success(`Saving plugin ${ config['display_name'] || config['name'] }`);
    plugin.attributes['config'] = config;
    plugin.create_or_update().subscribe(
      () => this.reloadPlugins(),
      err => {
        let errors = [];
        for (let k in err.error.errors) {
          errors.push(`${ k }: ${ err.error.errors[k].join(' / ') }`);
        }
        this.toastr.error(`Failed to save plugin<br />${ errors.join('<br />') }`, '', { enableHtml: true });
      }
    );
  }

  deletePlugin(arr: Array<SimpleAdminPluginResourceObject>, plugin: SimpleAdminPluginResourceObject) {
    if (!plugin.id) {
      let index = arr.indexOf(plugin);
      arr.splice(index, 1);
    } else {
      plugin.inUseBy().subscribe(r => {
        if (r.length) {
          let plugins = r.map(p => `${ p['name'] } / ${ p['plugin_name'] } / ${ p['plugin_type'] }`);
          this.toastr.error(`Failed to delete plugin because it is currently in use by ${ r.length } plugin${ r.length > 1 && 's' || '' }<br />` + plugins.join('<br />'), '', { enableHtml: true });
        } else {
          this.toastr.success(`Deleting plugin ${ plugin.attributes['name'] }`);
          plugin.delete().subscribe(() => this.reloadPlugins());
        }
      });
    }
  }

  commitChanges(plugin: PluginResourceObject) {
    this.toastr.warning(`Committing changes and reloading plugin ${ plugin.attributes['config']['display_name'] || plugin.attributes['config']['name'] }`);
    plugin.reload().subscribe();
  }

  rfsCanAccessInput(rfs: PluginResourceObject, plugin: PluginResourceObject) {
    return !!(rfs.attributes['config']['inputs'] || []).filter(p => p['input'] == plugin.id).length;
  }

  rfsSetInputAccess(rfs: PluginResourceObject, plugin: PluginResourceObject) {
    rfs.attributes['config']['inputs'] = rfs.attributes['config']['inputs'] || [];
    if (this.rfsCanAccessInput(rfs, plugin)) {
      rfs.attributes['config']['inputs'] = rfs.attributes['config']['inputs'].filter(p => p['input'] != plugin.id);
    } else {
      rfs.attributes['config']['inputs'].push({'input': plugin.id});
    }

    this.toastr.success(`Saving plugin ${ rfs.attributes['name'] }`);
    rfs.create_or_update().subscribe();
  }

  remoteSearcherCanAccessInput(remoteSearcher: PluginResourceObject, plugin: PluginResourceObject) {
    return !!(remoteSearcher.attributes['config']['searchers'] || []).filter(p => p['searcher'] == plugin.id).length;
  }

  remoteSearcherSetInputAccess(remoteSearcher: PluginResourceObject, plugin: PluginResourceObject) {
    remoteSearcher.attributes['config']['searchers'] = remoteSearcher.attributes['config']['searchers'] || [];
    if (this.remoteSearcherCanAccessInput(remoteSearcher, plugin)) {
      remoteSearcher.attributes['config']['searchers'] = remoteSearcher.attributes['config']['searchers'].filter(p => p['searcher'] != plugin.id);
    } else {
      remoteSearcher.attributes['config']['searchers'].push({'searcher': plugin.id});
    }

    this.toastr.success(`Saving plugin ${ remoteSearcher.attributes['name'] }`);
    remoteSearcher.create_or_update().subscribe();
  }

}
