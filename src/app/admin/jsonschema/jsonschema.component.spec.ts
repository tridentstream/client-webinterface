import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JsonschemaComponent } from './jsonschema.component';

describe('JsonschemaComponent', () => {
  let component: JsonschemaComponent;
  let fixture: ComponentFixture<JsonschemaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JsonschemaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JsonschemaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
