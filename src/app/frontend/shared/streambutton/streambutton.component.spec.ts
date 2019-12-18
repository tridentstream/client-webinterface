import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StreambuttonComponent } from './streambutton.component';

describe('StreambuttonComponent', () => {
  let component: StreambuttonComponent;
  let fixture: ComponentFixture<StreambuttonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StreambuttonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StreambuttonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
