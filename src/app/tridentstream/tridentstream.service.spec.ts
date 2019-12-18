import { TestBed } from '@angular/core/testing';

import { TridentstreamService } from './tridentstream.service';

describe('TridentstreamService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TridentstreamService = TestBed.get(TridentstreamService);
    expect(service).toBeTruthy();
  });
});
