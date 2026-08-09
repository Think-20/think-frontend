import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { InfocedenteComponent } from './infocedente.component';

describe('InfocedenteComponent', () => {
  let component: InfocedenteComponent;
  let fixture: ComponentFixture<InfocedenteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InfocedenteComponent ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InfocedenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit an edit event when the edit button is clicked', () => {
    let emitted = false;

    component.onEditar.subscribe(() => emitted = true);
    component.editar();

    expect(emitted).toBeTrue();
  });
});
