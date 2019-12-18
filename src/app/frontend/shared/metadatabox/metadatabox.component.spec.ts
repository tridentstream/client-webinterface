import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MetadataboxComponent } from './metadatabox.component';

describe('MetadataboxComponent', () => {
  let component: MetadataboxComponent;
  let fixture: ComponentFixture<MetadataboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MetadataboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MetadataboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
