import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsKanbanCardComponent } from './jobs-kanban-card.component';

describe('JobsKanbanCardComponent', () => {
  let component: JobsKanbanCardComponent;
  let fixture: ComponentFixture<JobsKanbanCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobsKanbanCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobsKanbanCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
