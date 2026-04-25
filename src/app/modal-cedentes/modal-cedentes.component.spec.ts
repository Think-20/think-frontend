import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCedentesComponent } from './modal-cedentes.component';

describe('ModalCedentesComponent', () => {
  let component: ModalCedentesComponent;
  let fixture: ComponentFixture<ModalCedentesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalCedentesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalCedentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
