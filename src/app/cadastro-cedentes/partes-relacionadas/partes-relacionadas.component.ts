import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CedenteDataService } from '../novo-cedente/cedente-data.service';
import { CpfCnpjValidator, OptionalEmailValidator, OptionalPhoneValidator, OptionalCepValidator } from '../../shared/custom-validators';

@Component({
  selector: 'cb-partes-relacionadas',
  templateUrl: './partes-relacionadas.component.html',
  styleUrls: ['./partes-relacionadas.component.css']
})
export class PartesRelacionadasComponent implements OnInit, OnChanges {
  @Input() index: number = 0;
  @Input() itemId: number = 0;
  @Input() data: any;
  @Output() onAdd = new EventEmitter<any>();
  @Output() onRemove = new EventEmitter<number>();
  @Output() onDuplicate = new EventEmitter<number>();
  
  formParteRelacionadas!:FormGroup;
  formDadosComplementares!:FormGroup;
  formEndereco!:FormGroup;
  formCheck!:FormGroup;
  cpfMask: string = 'cpfcnpj';
  telefoneMask: string = '(99) 99999-9999';
  cepMask: string = '99999-999';
  aberto: boolean = true;

  constructor( 
    private fb:FormBuilder, 
    private http: HttpClient, 
    private cedenteDataService: CedenteDataService
  ){}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data && this.formParteRelacionadas) {
      this.preencherFormulario();
    }
  }

  ngOnInit(){

    // partes Relacionadas
    this.formParteRelacionadas = this.fb.group({
      nome:['', [Validators.required]],
      tipo_parte_relacionada:[1, [Validators.required]],
      nacionalidade:['Brasileira'],
      email:['', [OptionalEmailValidator]],
      cpf:['', [Validators.required, CpfCnpjValidator]],
      telefone:['', [OptionalPhoneValidator]],
    });

    // Dados Complementares
    this.formDadosComplementares = this.fb.group({
      estado_civil:[''],
      regime_casamento:[''],
      profissao:['']
    });

    // enderecos
    this.formEndereco = this.fb.group({
      cep:['', [OptionalCepValidator]],
      logradouro:[''],
      numero:[''],
      bairro:[''],
      estado:[''],
      cidade:[''],
      complemento:[''],
      pais:['Brasil']
    });
    
    this.formCheck = this.fb.group({
      beneficiario_final:[false],
      assinante_operacao:[false],
      assinante_obrigatorio:[false],
    })
    // escuta mudanças em todos os forms
    this.formParteRelacionadas.valueChanges.subscribe(() => this.salvarAutomatico());
    this.formDadosComplementares.valueChanges.subscribe(() => this.salvarAutomatico());
    this.formEndereco.valueChanges.subscribe(() => this.salvarAutomatico());
    this.formCheck.valueChanges.subscribe(() => this.salvarAutomatico());

    const cepControl = this.formEndereco.get('cep');
    if (cepControl) {
      cepControl.valueChanges.subscribe((valor: string) => {
        const cep = valor.replace(/\D/g, '');
        if (cep.length === 8) {
          this.buscarCep();
        }
      });
    }

    this.preencherFormulario();
  }

  private preencherFormulario() {
    if (!this.data) {
      return;
    }

    this.formParteRelacionadas.patchValue(this.data, { emitEvent: false });
    this.formDadosComplementares.patchValue(this.data, { emitEvent: false });
    this.formEndereco.patchValue(this.data.endereco || {}, { emitEvent: false });
    this.formCheck.patchValue(this.data, { emitEvent: false });
  }
  isControlInvalid(form: FormGroup, controlName: string): boolean {
    const control = form.controls[controlName];
    return control && control.invalid && (control.dirty || control.touched);
  }

  getControlErrorMessage(form: FormGroup, controlName: string): string {
    const control = form.controls[controlName];
    if (!control || !control.errors) {
      return '';
    }

    if (control.errors.required) {
      return 'Campo obrigatório.';
    }
    if (control.errors.validCpfCnpj) {
      return 'CPF/CNPJ inválido.';
    }
    if (control.errors.validEmail) {
      return 'E-mail inválido.';
    }
    if (control.errors.validPhone) {
      return 'Telefone inválido.';
    }
    if (control.errors.validCep) {
      return 'CEP inválido.';
    }

    return 'Valor inválido.';
  }

  salvarAutomatico() {
    const parte = this.formParteRelacionadas.value;
    const complemento = this.formDadosComplementares.value;
    const endereco = this.formEndereco.value;
    const checks = this.formCheck.value;

    const data = {
      ...parte,
      ...complemento,
      ...checks,
      endereco: endereco
    };

    // Se o índice ainda não existe no array, adiciona
    const partes = this.cedenteDataService.obterPartesRelacionadas();
    if (this.index >= partes.length) {
      this.cedenteDataService.adicionarParteRelacionada(data);
    } else {
      this.cedenteDataService.atualizarParteRelacionada(this.index, data);
    }
  }

  buscarCep() {
  const cepControl = this.formEndereco.get('cep');
  if (!cepControl) {
    return;
  }
  
  const cep = cepControl.value.replace(/\D/g, '');
  if (cep.length !== 8) {
    return;
  }

  this.http
    .get<any>(`https://viacep.com.br/ws/${cep}/json/`)
    .subscribe({
      next: (dados) => {
        this.formEndereco.patchValue({
          logradouro: dados.logradouro,
          bairro: dados.bairro,
          cidade: dados.localidade,
          estado: dados.uf
        });
      },
      error: (erro) => {
        console.log('Erro ao buscar CEP', erro);
      }
    });
  }

  toggleContainer() {
    this.aberto = !this.aberto;
  }

  remover() {
  this.onRemove.emit(this.index);
  }

  duplicar() {
    const parte = this.formParteRelacionadas.value;
    const complemento = this.formDadosComplementares.value;
    const endereco = this.formEndereco.value;
    const checks = this.formCheck.value;
    const data = {
      ...parte,
      ...complemento,
      ...checks,
      endereco
    };
    this.onDuplicate.emit(data);
  }

}
