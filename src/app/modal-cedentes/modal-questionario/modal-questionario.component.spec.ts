import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalQuestionarioComponent } from './modal-questionario.component';

describe('ModalQuestionarioComponent', () => {
  let component: ModalQuestionarioComponent;
  let fixture: ComponentFixture<ModalQuestionarioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalQuestionarioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalQuestionarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
