import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CedenteDataService } from '../novo-cedente/cedente-data.service';
import { BankAccountNumberValidator, BankAccountDigitValidator } from '../../shared/custom-validators';

@Component({
  selector: 'cb-contas-desembolso',
  templateUrl: './contas-desembolso.component.html',
  styleUrls: ['./contas-desembolso.component.css']
})

export class ContasDesembolsoComponent implements OnInit, OnChanges {
  @Input() index: number = 0;
  @Input() itemId: number = 0;
  @Input() data: any;
  @Output() onAdd = new EventEmitter<any>();
  @Output() onRemove = new EventEmitter<number>();

  aberto:boolean = true;
  // formulario
  formularioDesembolso!: FormGroup;

  constructor( 
    private fb: FormBuilder, 
    private cedenteDataService: CedenteDataService
  ){}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.data && this.formularioDesembolso) {
      this.preencherFormulario();
    }
  }
  
  ngOnInit() {
    this.formularioDesembolso = this.fb.group({
      tipo_conta: ['conta_corrente'],
      codigo_banco: ['', [Validators.required]],
      agencia: ['', [Validators.required]],
      numero_conta: ['', [Validators.required, BankAccountNumberValidator]],
      digito_conta: ['', [Validators.required, BankAccountDigitValidator]],
      descricao: [''],
    });

    this.preencherFormulario();
    this.formularioDesembolso.valueChanges.subscribe(() => this.salvarAutomatico());
  }

  private preencherFormulario() {
    if (!this.data) {
      return;
    }

    this.formularioDesembolso.patchValue(this.data, { emitEvent: false });
  }
  
  toggleContainer() {
    this.aberto = !this.aberto;
  }

  remover() {
    this.onRemove.emit(this.index);
  }

  salvarAutomatico() {
    const data = this.formularioDesembolso.value;
      // pega o array atual do serviço
    const contas = this.cedenteDataService.obterContasDesembolso();
    
    if (this.index >= contas.length) {
      // se ainda não existe, adiciona
      this.cedenteDataService.adicionarContaDesembolso(data);
    } else {
      // se já existe, atualiza
      this.cedenteDataService.atualizarContaDesembolso(this.index, data);
    }
  }
}

