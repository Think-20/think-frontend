import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsKanbanColumnComponent } from './jobs-kanban-column.component';

describe('JobsKanbanColumnComponent', () => {
  let component: JobsKanbanColumnComponent;
  let fixture: ComponentFixture<JobsKanbanColumnComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobsKanbanColumnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobsKanbanColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
