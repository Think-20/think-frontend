import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CedenteDataService } from '../novo-cedente/cedente-data.service';
import { CpfCnpjValidator, OptionalEmailValidator, OptionalPhoneValidator, OptionalCepValidator } from '../../shared/custom-validators';

@Component({
  selector: 'cb-avalista',
  templateUrl: './avalista.component.html',
  styleUrls: ['./avalista.component.css']
})

export class AvalistaComponent implements OnInit, OnChanges {
  
  constructor( 
    private fb:FormBuilder, 
    private http: HttpClient,
    private cedenteDataService:CedenteDataService
  ){}

  @Input() index: number = 0;
  @Input() itemId: number = 0;
  @Output() onAdd = new EventEmitter<any>();
  @Output() onRemove = new EventEmitter<number>();
  @Output() onDuplicate = new EventEmitter<number>();
  @Input() data: any;

  formDadosCadastraisAvalista!: FormGroup;
  formDadosComplementaresAvalista!: FormGroup;
  formEnderecoAvalista!: FormGroup;
  formCheck!: FormGroup;
  cpfMask: string = 'cpfcnpj';
  telefoneMask: string = '(99) 99999-9999';
  cepMask: string = '99999-999';
  aberto: boolean = true;

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data && this.formDadosCadastraisAvalista) {
      this.preencherFormulario();
    }
  }

  ngOnInit(){

    // partes Relacionadas
    this.formDadosCadastraisAvalista = this.fb.group({
      nome:['', [Validators.required]],
      email:['', [OptionalEmailValidator]],
      cpf:['', [Validators.required, CpfCnpjValidator]],
      telefone:['', [OptionalPhoneValidator]],
    });

    // Dados Complementares
    this.formDadosComplementaresAvalista = this.fb.group({
      nacionalidade:['Brasileiro'],
      estado_civil:[''],
      regime_casamento:[''],
      profissao:['']
    });

    // enederecos
    this.formEnderecoAvalista = this.fb.group({
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
      assinante_obrigatorio:[true],
    });
    
    const cepControl = this.formEnderecoAvalista.get('cep');
    if (cepControl) {
      cepControl.valueChanges.subscribe((valor: string) => {
        const cep = valor.replace(/\D/g, '');
        if (cep.length === 8) {
          this.buscarCep();
        }
      });
    }

    this.preencherFormulario();

    this.formDadosCadastraisAvalista.valueChanges.subscribe(()=>this.salvarAutomatico());
    this.formDadosComplementaresAvalista.valueChanges.subscribe(()=>this.salvarAutomatico());
    this.formEnderecoAvalista.valueChanges.subscribe(()=>this.salvarAutomatico());
    this.formCheck.valueChanges.subscribe(()=>this.salvarAutomatico());
  }

  private preencherFormulario() {
    if (!this.data) {
      return;
    }

    this.formDadosCadastraisAvalista.patchValue(this.data, { emitEvent: false });
    this.formDadosComplementaresAvalista.patchValue(this.data, { emitEvent: false });
    this.formEnderecoAvalista.patchValue(this.data.endereco || {}, { emitEvent: false });
    this.formCheck.patchValue(this.data, { emitEvent: false });
  }

  buscarCep() {
    const cepControl = this.formEnderecoAvalista.get('cep');
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
      
        this.formEnderecoAvalista.patchValue({
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
  const dados = this.formDadosCadastraisAvalista.value;
  const complemento = this.formDadosComplementaresAvalista.value;
  const endereco = this.formEnderecoAvalista.value;
  const checks = this.formCheck.value;

  const data = {
    ...dados,
    ...complemento,
    ...checks,
    endereco: endereco
  };

  const avalistas = this.cedenteDataService.obterAvalistas();

  if (this.index >= avalistas.length) {
    this.cedenteDataService.adicionarAvalista(data);
    return;
  }

  this.cedenteDataService.atualizarAvalista(this.index, data);
}

  remover() {
    this.onRemove.emit(this.index);
  }

  duplicar() {
    this.onDuplicate.emit(this.index);
  }
}

