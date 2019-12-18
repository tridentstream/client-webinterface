import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedpluginsComponent } from './advancedplugins.component';

describe('AdvancedpluginsComponent', () => {
  let component: AdvancedpluginsComponent;
  let fixture: ComponentFixture<AdvancedpluginsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdvancedpluginsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvancedpluginsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
