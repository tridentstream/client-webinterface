import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalpluginsComponent } from './externalplugins.component';

describe('ExternalpluginsComponent', () => {
  let component: ExternalpluginsComponent;
  let fixture: ComponentFixture<ExternalpluginsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExternalpluginsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExternalpluginsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
