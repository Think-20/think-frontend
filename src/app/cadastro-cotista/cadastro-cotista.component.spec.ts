import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

import { CadastroCotistaComponent } from './cadastro-cotista.component';

describe('CadastroCotistaComponent', () => {
  let component: CadastroCotistaComponent;
  let fixture: ComponentFixture<CadastroCotistaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CadastroCotistaComponent ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CadastroCotistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show the cadastral form after receiving a valid identification', () => {
    component.iniciarCadastro();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('cb-identificacao-inicial')).not.toBeNull();

    component.receberIdentificacao({
      tipoInvestidor: 'PESSOA_FISICA',
      documento: '52998224725'
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('cb-identificacao-inicial')).toBeNull();
    expect(fixture.nativeElement.querySelector('cb-ficha-cadastral')).not.toBeNull();
  });

  it('should hide, but preserve, the cadastral form while showing suitability', () => {
    component.receberIdentificacao({
      tipoInvestidor: 'PESSOA_FISICA',
      documento: '52998224725'
    });
    fixture.detectChanges();
    const cadastralForm = fixture.nativeElement.querySelector('cb-ficha-cadastral');

    component.continuarParaSuitability();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('cb-ficha-cadastral')).toBe(cadastralForm);
    expect(cadastralForm.parentElement.hidden).toBe(true);
    expect(fixture.nativeElement.querySelector('cb-questionario-suitability')).not.toBeNull();

    component.voltarParaFichaCadastral();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('cb-ficha-cadastral')).toBe(cadastralForm);
    expect(cadastralForm.parentElement.hidden).toBe(false);
    expect(fixture.nativeElement.querySelector('cb-questionario-suitability')).toBeNull();
  });
});
