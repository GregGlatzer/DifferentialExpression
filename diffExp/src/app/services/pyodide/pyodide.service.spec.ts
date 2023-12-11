import { TestBed } from '@angular/core/testing';

import { PyodideService } from './pyodide.service';

describe('PyodideService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PyodideService = TestBed.get(PyodideService);
    expect(service).toBeTruthy();
  });
});
