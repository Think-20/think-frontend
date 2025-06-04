import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsKanbanComponent } from './jobs-kanban.component';

describe('JobsKanbanComponent', () => {
  let component: JobsKanbanComponent;
  let fixture: ComponentFixture<JobsKanbanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobsKanbanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobsKanbanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
