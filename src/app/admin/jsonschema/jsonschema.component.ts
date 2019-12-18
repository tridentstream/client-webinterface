import { Component, OnInit, ElementRef, ViewChild, Input, Output, EventEmitter, OnChanges } from '@angular/core';

import { createSchema } from './jsonschema.component.react';

@Component({
  selector: 'app-jsonschema',
  template: `<div class="jsonschema"><div #hook></div></div>`,
  styleUrls: ['./jsonschema.component.css']
})
export class JsonschemaComponent implements OnInit, OnChanges {
  @ViewChild('hook') public hook: ElementRef;

  @Input() schema: Object;
  @Input() uiSchema: Object = {};
  @Input() initialData: Object;
  @Input() showDelete = false;
  @Input() showReload = false;
  @Output() onSave: EventEmitter<Object> = new EventEmitter();
  @Output() onDelete: EventEmitter<null> = new EventEmitter();

  public submitted = (data: Object) => {
    this.onSave.emit(data['formData']);
  }

  public deleted = () => {
    this.onDelete.emit(null);
  }

  ngOnInit() {
    createSchema(this.hook.nativeElement,
                 this.schema,
                 this.uiSchema,
                 this.initialData,
                 this.submitted,
                 this.showDelete && this.deleted || null);
  }

  ngOnChanges() {
    this.ngOnInit()
  }

}
