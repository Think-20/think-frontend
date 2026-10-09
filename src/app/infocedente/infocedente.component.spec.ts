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

  it('should hide edit permission for canceled cedentes', () => {
    component.cedente = { status: 'Cancelado' };

    expect(component.podeEditarCedente).toBeFalse();
  });

  it('should mark only the related party matching the inconsistent socio index', () => {
    component.cedente = {
      inconsistencias: [{ campo_inconsistente: 'socios[1].nome', valor_serpro: 'Nome oficial' }]
    };

    expect(component.isCampoInconsistente('partes_relacionadas[0].nome')).toBeFalse();
    expect(component.isCampoInconsistente('partes_relacionadas[1].nome')).toBeTrue();
    expect(component.getValorSerproCampo('partes_relacionadas[1].nome')).toBe('Nome oficial');
  });
});
