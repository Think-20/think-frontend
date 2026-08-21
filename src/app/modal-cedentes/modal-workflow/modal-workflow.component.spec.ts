import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalWorkflowComponent } from './modal-workflow.component';

describe('ModalWorkflowComponent', () => {
  let component: ModalWorkflowComponent;
  let fixture: ComponentFixture<ModalWorkflowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalWorkflowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalWorkflowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
