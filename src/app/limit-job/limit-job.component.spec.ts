import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LimitJobComponent } from './limit-job.component';

describe('LimitJobComponent', () => {
  let component: LimitJobComponent;
  let fixture: ComponentFixture<LimitJobComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LimitJobComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LimitJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
