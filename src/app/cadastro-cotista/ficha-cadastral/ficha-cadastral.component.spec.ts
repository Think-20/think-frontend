import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MaskDirective } from '../../shared/mask.directive';
import { FichaCadastralComponent } from './ficha-cadastral.component';

describe('FichaCadastralComponent', () => {
  let component: FichaCadastralComponent;
  let fixture: ComponentFixture<FichaCadastralComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule],
      declarations: [ FichaCadastralComponent, MaskDirective ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FichaCadastralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit when continuing to suitability', () => {
    const continueSpy = spyOn(component.continuarSuitability, 'emit');
    const continueButton = fixture.nativeElement.querySelector('.continue-button') as HTMLButtonElement;

    continueButton.click();

    expect(continueSpy).toHaveBeenCalled();
  });

  it('should render eleven collapsed questionnaires', () => {
    const toggles = fixture.nativeElement.querySelectorAll('.ficha-toggle');

    expect(toggles.length).toBe(11);
    for (let index = 0; index < toggles.length; index++) {
      expect(toggles[index].getAttribute('aria-expanded')).toBe('false');
    }
  });

  it('should toggle a questionnaire without clearing its fields', () => {
    const toggle = fixture.nativeElement.querySelector('.ficha-toggle') as HTMLButtonElement;
    const input = fixture.nativeElement.querySelector('.questionario input') as HTMLInputElement;
    const questionnaire = fixture.nativeElement.querySelector('.questionario') as HTMLDivElement;

    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(questionnaire.hidden).toBe(false);

    input.value = 'Nome preenchido';
    input.dispatchEvent(new Event('input'));
    toggle.click();
    fixture.detectChanges();
    expect(questionnaire.hidden).toBe(true);

    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(input.value).toBe('Nome preenchido');
  });

  it('should render the client identification fields in the reference layout', () => {
    component.identificacao = {
      tipoInvestidor: 'PESSOA_FISICA',
      documento: '50275221857'
    };
    component.alternarFicha(component.fichas[0]);
    fixture.detectChanges();

    const questionnaire = fixture.nativeElement.querySelector('.questionario');
    const fields = questionnaire.querySelectorAll('.field');
    const documentInput = questionnaire.querySelector('#campo-0-0-1') as HTMLInputElement;

    expect(fields.length).toBe(20);
    expect(questionnaire.querySelector('.identification-grid')).not.toBeNull();
    expect(questionnaire.querySelectorAll('select').length).toBe(4);
    expect(questionnaire.querySelectorAll('.radio-options input[type="radio"]').length).toBe(2);
    expect(documentInput.value).toBe('502.752.218-57');
    expect(documentInput.readOnly).toBe(true);
  });

  it('should apply Brazilian CPF, CNPJ, CEP and phone masks', () => {
    component.alternarFicha(component.fichas[0]);
    component.alternarFicha(component.fichas[1]);
    fixture.detectChanges();

    const spouseCpf = fixture.nativeElement.querySelector('#campo-0-0-10') as HTMLInputElement;
    const residentialCep = fixture.nativeElement.querySelector('#campo-1-0-0') as HTMLInputElement;

    spouseCpf.value = '12345678901';
    spouseCpf.dispatchEvent(new KeyboardEvent('keyup', { key: '1' }));
    fixture.detectChanges();
    expect(spouseCpf.value).toBe('123.456.789-01');

    residentialCep.value = '12345678';
    residentialCep.dispatchEvent(new KeyboardEvent('keyup', { key: '8' }));
    fixture.detectChanges();
    expect(residentialCep.value).toBe('12345-678');

    const phone = fixture.nativeElement.querySelector('#campo-1-0-13') as HTMLInputElement;
    phone.value = '11912345678';
    phone.dispatchEvent(new KeyboardEvent('keyup', { key: '8' }));
    fixture.detectChanges();
    expect(phone.value).toBe('(11) 91234-5678');

    component.alternarFicha(component.fichas[2]);
    fixture.detectChanges();
    const employerCnpj = fixture.nativeElement.querySelector('#campo-2-0-2') as HTMLInputElement;
    employerCnpj.value = '12345678000199';
    employerCnpj.dispatchEvent(new KeyboardEvent('keyup', { key: '9' }));
    fixture.detectChanges();
    expect(employerCnpj.value).toBe('12.345.678/0001-99');
  });

  it('should render the residential address fields and options', () => {
    component.alternarFicha(component.fichas[1]);
    fixture.detectChanges();

    const questionnaire = fixture.nativeElement.querySelector('#questionario-1');
    const fields = questionnaire.querySelectorAll('.field');

    expect(fields.length).toBe(17);
    expect(questionnaire.querySelector('.address-grid')).not.toBeNull();
    expect(questionnaire.querySelectorAll('.radio-options input[type="radio"]').length).toBe(8);
    expect(questionnaire.textContent).toContain('Tempo de residência');
    expect(questionnaire.textContent).toContain('Endereço para correspondência');
    expect(questionnaire.textContent).toContain('É considerado uma “U.S. Person”?');
  });

  it('should render the occupation and professional fields in the reference layout', () => {
    component.alternarFicha(component.fichas[2]);
    fixture.detectChanges();

    const questionnaire = fixture.nativeElement.querySelector('#questionario-2');

    expect(questionnaire.querySelector('.occupation-grid')).not.toBeNull();
    expect(questionnaire.querySelectorAll('.field').length).toBe(14);
    expect(questionnaire.querySelectorAll('select').length).toBe(1);
    expect(questionnaire.textContent).toContain('Natureza da ocupação (principal fonte de renda)');
    expect(questionnaire.textContent).toContain('Instituição em que trabalha');
    expect(questionnaire.textContent).toContain('CNPJ do empregador');
    expect(questionnaire.textContent).toContain('E-mail comercial');
  });

  it('should add another reference without clearing existing reference values', () => {
    component.alternarFicha(component.fichas[3]);
    fixture.detectChanges();

    const nameInput = fixture.nativeElement.querySelector('#referencia-nome-0') as HTMLInputElement;
    nameInput.value = 'Maria da Silva';
    nameInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const addButton = fixture.nativeElement.querySelector('.add-reference-button') as HTMLButtonElement;
    addButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.reference-card').length).toBe(3);
    expect((fixture.nativeElement.querySelector('#referencia-nome-0') as HTMLInputElement).value)
      .toBe('Maria da Silva');
    expect(fixture.nativeElement.querySelector('#referencia-nome-2')).not.toBeNull();

    const removeButton = fixture.nativeElement.querySelector(
      '[aria-label="Remover referência 2"]'
    ) as HTMLButtonElement;
    removeButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.reference-card').length).toBe(2);
    expect((fixture.nativeElement.querySelector('#referencia-nome-0') as HTMLInputElement).value)
      .toBe('Maria da Silva');
  });

  it('should render and add bank accounts without clearing existing values', () => {
    component.alternarFicha(component.fichas[4]);
    fixture.detectChanges();

    const questionnaire = fixture.nativeElement.querySelector('#questionario-4');
    expect(questionnaire.querySelectorAll('.bank-account-card').length).toBe(1);
    expect(questionnaire.querySelectorAll('.bank-account-grid .field').length).toBe(4);
    expect(questionnaire.querySelectorAll('.bank-account-grid select').length).toBe(1);

    const bankInput = questionnaire.querySelector('#conta-banco-0') as HTMLInputElement;
    bankInput.value = 'Banco Exemplo';
    bankInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const addButton = questionnaire.querySelector('.add-reference-button') as HTMLButtonElement;
    addButton.click();
    fixture.detectChanges();

    expect(questionnaire.querySelectorAll('.bank-account-card').length).toBe(2);
    expect((questionnaire.querySelector('#conta-banco-0') as HTMLInputElement).value)
      .toBe('Banco Exemplo');
    expect(questionnaire.querySelector('#conta-banco-1')).not.toBeNull();

    const removeButton = questionnaire.querySelector(
      '[aria-label="Remover conta bancária 2"]'
    ) as HTMLButtonElement;
    removeButton.click();
    fixture.detectChanges();

    expect(questionnaire.querySelectorAll('.bank-account-card').length).toBe(1);
    expect((questionnaire.querySelector('#conta-banco-0') as HTMLInputElement).value)
      .toBe('Banco Exemplo');
  });

  it('should render and add patrimonial items without clearing existing values', () => {
    component.alternarFicha(component.fichas[5]);
    fixture.detectChanges();

    const questionnaire = fixture.nativeElement.querySelector('#questionario-5');
    expect(questionnaire.querySelectorAll('.patrimonial-card').length).toBe(1);
    expect(questionnaire.querySelectorAll('.patrimonial-grid .field').length).toBe(3);
    expect(questionnaire.querySelectorAll('.patrimonial-grid select').length).toBe(1);

    const descriptionInput = questionnaire.querySelector('#patrimonio-descricao-0') as HTMLInputElement;
    descriptionInput.value = 'Apartamento';
    descriptionInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const addButton = questionnaire.querySelector('.add-patrimonial-button') as HTMLButtonElement;
    addButton.click();
    fixture.detectChanges();

    expect(questionnaire.querySelectorAll('.patrimonial-card').length).toBe(2);
    expect((questionnaire.querySelector('#patrimonio-descricao-0') as HTMLInputElement).value)
      .toBe('Apartamento');
    expect(questionnaire.querySelector('#patrimonio-descricao-1')).not.toBeNull();

    const removeButton = questionnaire.querySelector(
      '[aria-label="Remover item patrimonial 2"]'
    ) as HTMLButtonElement;
    removeButton.click();
    fixture.detectChanges();

    expect(questionnaire.querySelectorAll('.patrimonial-card').length).toBe(1);
    expect((questionnaire.querySelector('#patrimonio-descricao-0') as HTMLInputElement).value)
      .toBe('Apartamento');
  });

  it('should render foreign investor fields with the requested status options', () => {
    component.alternarFicha(component.fichas[6]);
    fixture.detectChanges();

    const questionnaire = fixture.nativeElement.querySelector('#questionario-6');
    const situationSelect = questionnaire.querySelector('#campo-6-0-7') as HTMLSelectElement;

    expect(questionnaire.querySelector('.foreign-investor-grid')).not.toBeNull();
    expect(questionnaire.querySelectorAll('.field').length).toBe(8);
    expect(questionnaire.textContent).toContain('Cód. operacional CVM');
    expect(questionnaire.textContent).toContain('BDE (Nº BACEN) / CADEMP');
    expect(questionnaire.textContent).toContain('Representante no Brasil');
    expect(situationSelect.options.length).toBe(3);
    expect(situationSelect.options[1].text).toBe('Isento');
    expect(situationSelect.options[2].text).toBe('Não isento');
  });

  it('should render and add company participations without clearing existing values', () => {
    component.alternarFicha(component.fichas[7]);
    fixture.detectChanges();

    const questionnaire = fixture.nativeElement.querySelector('#questionario-7');
    expect(questionnaire.querySelectorAll('.participation-card').length).toBe(1);
    expect(questionnaire.querySelectorAll('.participation-grid .field').length).toBe(5);
    expect(questionnaire.querySelectorAll('.participation-financial input[type="radio"]').length).toBe(2);
    expect(questionnaire.textContent).toContain('Razão social');
    expect(questionnaire.textContent).toContain('GIIN Number (se sim)');

    const companyInput = questionnaire.querySelector('#participacao-razao-social-0') as HTMLInputElement;
    companyInput.value = 'Empresa Exemplo';
    companyInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const addButton = questionnaire.querySelector('.add-participation-button') as HTMLButtonElement;
    addButton.click();
    fixture.detectChanges();

    expect(questionnaire.querySelectorAll('.participation-card').length).toBe(2);
    expect((questionnaire.querySelector('#participacao-razao-social-0') as HTMLInputElement).value)
      .toBe('Empresa Exemplo');
    expect(questionnaire.querySelector('#participacao-razao-social-1')).not.toBeNull();
  });

  it('should render business purposes and enable the other-purpose field when selected', () => {
    component.alternarFicha(component.fichas[8]);
    fixture.detectChanges();

    const questionnaire = fixture.nativeElement.querySelector('#questionario-8');
    const checkboxes = questionnaire.querySelectorAll('.purpose-options input[type="checkbox"]');
    const otherCheckbox = questionnaire.querySelector('#proposito-5') as HTMLInputElement;
    const otherPurposeInput = questionnaire.querySelector('#outro-proposito') as HTMLInputElement;

    expect(checkboxes.length).toBe(6);
    expect(questionnaire.textContent).toContain('Operações de crédito');
    expect(questionnaire.textContent).toContain('Operações acessórias (serviços, garantias)');
    expect(otherPurposeInput.disabled).toBe(true);

    otherCheckbox.click();
    fixture.detectChanges();
    expect(otherPurposeInput.disabled).toBe(false);

    otherPurposeInput.value = 'Investimento internacional';
    otherPurposeInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.outroProposito).toBe('Investimento internacional');
  });

  it('should render PPE questions and enable detail fields when answered yes', () => {
    component.alternarFicha(component.fichas[9]);
    fixture.detectChanges();

    const questionnaire = fixture.nativeElement.querySelector('#questionario-9');
    const radios = questionnaire.querySelectorAll('.ppe-question input[type="radio"]');
    const roleInput = questionnaire.querySelector('#ppe-cargo') as HTMLInputElement;
    const relatedInput = questionnaire.querySelector('#ppe-relacionado') as HTMLTextAreaElement;

    expect(radios.length).toBe(4);
    expect(questionnaire.textContent).toContain('Sou uma Pessoa Politicamente Exposta (PPE)?');
    expect(questionnaire.textContent).toContain('Tenho relacionamento com uma PPE?');
    expect(roleInput.disabled).toBe(true);
    expect(relatedInput.disabled).toBe(true);

    const exposedYes = questionnaire.querySelector(
      'input[name="pessoa-politicamente-exposta"][value="Sim"]'
    ) as HTMLInputElement;
    exposedYes.click();
    fixture.detectChanges();
    expect(roleInput.disabled).toBe(false);

    const relatedYes = questionnaire.querySelector(
      'input[name="relacionamento-ppe"][value="Sim"]'
    ) as HTMLInputElement;
    relatedYes.click();
    fixture.detectChanges();
    expect(relatedInput.disabled).toBe(false);
  });

  it('should render proxy fields and enable PPE details when answered yes', () => {
    component.alternarFicha(component.fichas[10]);
    fixture.detectChanges();

    const questionnaire = fixture.nativeElement.querySelector('#questionario-10');
    const radios = questionnaire.querySelectorAll('.radio-options input[type="radio"]');
    const proxyRole = questionnaire.querySelector('#procurador-cargo-ppe') as HTMLInputElement;
    const relatedDetails = questionnaire.querySelector('#procurador-relacao-detalhes') as HTMLTextAreaElement;

    expect(questionnaire.querySelector('.proxy-grid')).not.toBeNull();
    expect(questionnaire.querySelectorAll('.field').length).toBe(13);
    expect(radios.length).toBe(8);
    expect(questionnaire.textContent).toContain('Opera por conta própria?');
    expect(questionnaire.textContent).toContain('Autoriza emissão de ordens por procurador?');
    expect(questionnaire.textContent).toContain('Descrição dos poderes conferidos');
    expect(proxyRole.disabled).toBe(true);
    expect(relatedDetails.disabled).toBe(true);

    const proxyPpeYes = questionnaire.querySelector(
      'input[name="procurador-ppe"][value="Sim"]'
    ) as HTMLInputElement;
    proxyPpeYes.click();
    fixture.detectChanges();
    expect(proxyRole.disabled).toBe(false);

    proxyRole.value = 'Diretor';
    proxyRole.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const relatedYes = questionnaire.querySelector(
      'input[name="procurador-relacionamento-ppe"][value="Sim"]'
    ) as HTMLInputElement;
    relatedYes.click();
    fixture.detectChanges();
    expect(relatedDetails.disabled).toBe(false);

    const proxyPpeNo = questionnaire.querySelector(
      'input[name="procurador-ppe"][value="Não"]'
    ) as HTMLInputElement;
    proxyPpeNo.click();
    fixture.detectChanges();
    expect(proxyRole.disabled).toBe(true);
    expect(proxyRole.value).toBe('');
  });

  it('should show the attachment area and sticky form actions', () => {
    expect(fixture.nativeElement.querySelector('.documents')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.form-actions')).not.toBeNull();
    expect(fixture.nativeElement.querySelectorAll('.attach-button').length).toBe(2);
  });

  it('should show the attached file name and size and allow removing it', () => {
    const input = fixture.nativeElement.querySelector('#documento-identificacao') as HTMLInputElement;
    const file = new File(['documento de teste'], 'identidade.pdf', { type: 'application/pdf' });
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const fileRow = fixture.nativeElement.querySelector('.document-upload .selected-file');
    expect(fileRow.textContent).toContain('identidade.pdf');
    expect(fileRow.textContent).toContain('KB');
    expect(fileRow.querySelectorAll('.file-action').length).toBe(2);
    expect(fixture.nativeElement.querySelector('.attach-button').textContent).toContain('Substituir');

    const removeButton = fixture.nativeElement.querySelector(
      '[aria-label="Excluir documento de identificação"]'
    ) as HTMLButtonElement;
    removeButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.document-upload .selected-file')).toBeNull();
    expect(input.value).toBe('');
  });
});
