import { Component, Input, OnInit } from '@angular/core';
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms';

type AvaliacaoAcao = 'aprovar' | 'corrigir' | 'rejeitar' | null;

@Component({
  selector: 'cb-avaliacao-cedente-info',
  templateUrl: './avaliacao-cedente-info.component.html',
  styleUrls: ['./avaliacao-cedente-info.component.css']
})
export class AvaliacaoCedenteInfoComponent implements OnInit {
  @Input() cedente: any;

  selectedAcao: AvaliacaoAcao = null;

  constructor(private fb:FormBuilder) { }

  // Formularios
  formAprovacao!: FormGroup;
  formCorrecao!: FormGroup;
  formRejeicao!: FormGroup;

  ngOnInit() {

    // inicializando os formularios
    this.formAprovacao = this.fb.group({
      limiteAprovado: ['', Validators.required],
      prazoAtualizacao: ['6', Validators.required],
      observacao:['']
    });
    this.formCorrecao = this.fb.group({
      observacao:['']
    });
    this.formRejeicao = this.fb.group({
        observacao:['']
    })
  }

  selecionarAcao(acao: AvaliacaoAcao) {
    this.selectedAcao = this.selectedAcao === acao ? null : acao;
  }

  isAcaoSelecionada(acao: AvaliacaoAcao): boolean {
    return this.selectedAcao === acao;
  }

}
