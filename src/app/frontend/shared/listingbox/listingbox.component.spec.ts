import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListingboxComponent } from './listingbox.component';

describe('ListingboxComponent', () => {
  let component: ListingboxComponent;
  let fixture: ComponentFixture<ListingboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListingboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListingboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
