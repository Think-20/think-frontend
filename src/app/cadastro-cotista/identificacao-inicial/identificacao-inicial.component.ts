import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CpfCnpjValidator } from '../../shared/custom-validators';

export type TipoInvestidor = 'PESSOA_FISICA' | 'PESSOA_JURIDICA';

export interface IdentificacaoCotista {
  tipoInvestidor: TipoInvestidor;
  documento: string;
}

@Component({
  selector: 'cb-identificacao-inicial',
  templateUrl: './identificacao-inicial.component.html',
  styleUrls: ['./identificacao-inicial.component.css']
})
export class IdentificacaoInicialComponent implements OnInit {
  @Output() continuarCadastro = new EventEmitter<IdentificacaoCotista>();

  formulario: FormGroup;
  submitted = false;

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.formulario = this.formBuilder.group({
      tipoInvestidor: ['PESSOA_FISICA', Validators.required],
      documento: ['', [Validators.required, control => {
        const digits = String(control.value || '').replace(/\D/g, '');
        const expectedLength = this.formulario
          && this.formulario.get('tipoInvestidor').value === 'PESSOA_JURIDICA' ? 14 : 11;

        if (digits.length !== expectedLength) {
          return { documentLength: true };
        }

        return CpfCnpjValidator(control);
      }]]
    });

    this.formulario.get('tipoInvestidor').valueChanges.subscribe(() => {
      this.formulario.get('documento').setValue('');
      this.formulario.get('documento').updateValueAndValidity();
    });
  }

  get tipoDocumento(): string {
    return this.formulario && this.formulario.get('tipoInvestidor').value === 'PESSOA_JURIDICA'
      ? 'CNPJ'
      : 'CPF';
  }

  get placeholderDocumento(): string {
    return this.tipoDocumento === 'CNPJ' ? '00.000.000/0000-00' : '000.000.000-00';
  }

  get mascaraDocumento(): string {
    return this.tipoDocumento === 'CNPJ' ? '99.999.999/9999-99' : '999.999.999-99';
  }

  get documentoInvalido(): boolean {
    const documento = this.formulario && this.formulario.get('documento');
    return !!(documento && documento.invalid && (documento.touched || this.submitted));
  }

  continuar(): void {
    this.submitted = true;
    this.formulario.markAllAsTouched();

    if (this.formulario.invalid) {
      return;
    }

    const dados = this.formulario.value;
    this.continuarCadastro.emit({
      tipoInvestidor: dados.tipoInvestidor,
      documento: String(dados.documento).replace(/\D/g, '')
    });
  }
}
