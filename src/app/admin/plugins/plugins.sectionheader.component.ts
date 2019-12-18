import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';

import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import {
  Tridentstream,
  PluginResourceObject,
} from '../../tridentstream';


@Component({
  selector: 'app-plugin-sectionheader',
  templateUrl: './plugins.sectionheader.component.html'
})
export class PluginSectionHeaderComponent implements OnInit {
  @Input() section: PluginResourceObject;
  @Output() commitChanges: EventEmitter<void> = new EventEmitter();
  @Output() addNewSection: EventEmitter<void> = new EventEmitter();

  public iconLoading = faSpinner;

  public editingName = false;
  public setNameLoading = false;

  public initialDisplayName = '';

  constructor() { }

  ngOnInit() {
  }

  editName() {
    this.initialDisplayName = this.section.attributes['config']['display_name'];
    this.editingName = !this.editingName;
  }

  onSetName(f: NgForm) {
    this.setNameLoading = true;
    this.section.attributes['config']['display_name'] = f.value['name'];
    this.section.setDisplayName(f.value['name']).subscribe(r => {
      this.editingName = false;
      this.setNameLoading = false;
    });
  }
}
