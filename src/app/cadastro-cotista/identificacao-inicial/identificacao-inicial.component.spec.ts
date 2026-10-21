import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { IdentificacaoInicialComponent } from './identificacao-inicial.component';
import { MaskDirective } from '../../shared/mask.directive';

describe('IdentificacaoInicialComponent', () => {
  let component: IdentificacaoInicialComponent;
  let fixture: ComponentFixture<IdentificacaoInicialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [IdentificacaoInicialComponent, MaskDirective]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdentificacaoInicialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('emits investor type and document as digits after valid submission', () => {
    const emitSpy = spyOn(component.continuarCadastro, 'emit');
    component.formulario.setValue({
      tipoInvestidor: 'PESSOA_FISICA',
      documento: '529.982.247-25'
    });

    component.continuar();

    expect(emitSpy).toHaveBeenCalledWith({
      tipoInvestidor: 'PESSOA_FISICA',
      documento: '52998224725'
    });
  });
});
