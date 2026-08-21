import { Component, OnInit, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { ModalCedentesStateService } from './modal-cedentes-state.service';

interface FundoOpcao {
  id: number;
  nome: string;
  codigo: string;
  categoria: string;
}

interface QuestionarioOpcao {
  id: number;
  nome: string;
  descricao: string;
  perguntas: number;
}

@Component({
  selector: 'cb-modal-cedentes',
  templateUrl: './modal-cedentes.component.html',
  styleUrls: ['./modal-cedentes.component.css']
})
export class ModalCedentesComponent implements OnInit {
  @Output() toggleModal = new EventEmitter<void>();

  mostrarQuestionario: boolean = false;
  mostrarWorkflow: boolean = false;
  selecionado: number | null = null;
  questionarioSelecionado: QuestionarioOpcao | null = null;

  fundos: FundoOpcao[] = [
    { id: 1, nome: 'Fundo de Renda Fixa Epsilon', codigo: 'FRF-005', categoria: 'Renda Fixa' },
    { id: 2, nome: 'Fundo de Infraestrutura Zeta', codigo: 'FIN-0046', categoria: 'Infraestrutura' },
    { id: 3, nome: 'Fundo FIDC Theta', codigo: 'FIDC-007', categoria: 'FIDC' },
    { id: 4, nome: 'Fundo de Investimento Kappa', codigo: 'FIV-008', categoria: 'Investimento' }
  ];

  constructor(private modalCedentesStateService: ModalCedentesStateService) { }


  ngOnInit() {
  }

  toggle(): void {
    this.modalCedentesStateService.reset();
    this.toggleModal.emit();
  }

  get fundoSelecionado(): FundoOpcao | null {
    return this.fundos.find((fundo) => fundo.id === this.selecionado) || null;
  }

  choiceBackground(id: number): void {
    this.selecionado = id;

    const fundo = this.fundos.find((item) => item.id === id) || null;
    this.modalCedentesStateService.fundoSelecionado = fundo;
  }

  nextStep(): void {
    if (this.selecionado != null) {
      this.mostrarWorkflow = false;
      this.mostrarQuestionario = true;
    } else {
      console.log('Selecione um fundo primeiro');
    }
  }

  voltarParaPasso1(): void {
    this.mostrarQuestionario = false;
    this.mostrarWorkflow = false;
  }

  abrirWorkflow(questionario: QuestionarioOpcao): void {
    this.questionarioSelecionado = questionario;
    this.modalCedentesStateService.questionarioSelecionado = questionario;
    this.mostrarQuestionario = false;
    this.mostrarWorkflow = true;
  }

  voltarParaQuestionario(): void {
    this.mostrarWorkflow = false;
    this.mostrarQuestionario = true;
  }

}
