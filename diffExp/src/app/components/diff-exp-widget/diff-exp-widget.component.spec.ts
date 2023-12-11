import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiffExpWidgetComponent } from './diff-exp-widget.component';

describe('DiffExpWidgetComponent', () => {
  let component: DiffExpWidgetComponent;
  let fixture: ComponentFixture<DiffExpWidgetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiffExpWidgetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiffExpWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
