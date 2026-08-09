import { Component, OnInit, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';

interface Questionario {
  id: number;
  nome: string;
  descricao: string;
  perguntas: number;
}

@Component({
  selector: 'cb-modal-questionario',
  templateUrl: './modal-questionario.component.html',
  styleUrls: ['./modal-questionario.component.css']
})
export class ModalQuestionarioComponent implements OnInit {
  @Output() toggleModal = new EventEmitter<void>();

  selecionado: number | null = null;
  etapaAtual: number = 2;
  mostrarWorkflow: boolean = false;

  questionarios: Questionario[] = [
    { id: 1, nome: 'Questionário Padrão - Pessoa Jurídica', descricao: 'Template padrão para cadastro de empresa', perguntas: 45 },
    { id: 2, nome: 'Questionário Simplificado', descricao: 'Template com perguntas essenciais', perguntas: 25 },
    { id: 3, nome: 'Questionário Completo - Due Diligence', descricao: 'Template detalhado para análise aprofundada', perguntas: 78 },
    { id: 4, nome: 'Questionário KYC Básico', descricao: 'Template focado em KYC e compliance', perguntas: 32 }
  ];

  constructor() { }

  ngOnInit(): void {
    this.resetarModal();
  }

  private resetarModal(): void {
    this.selecionado = null;
  }

  choiceBackground(id: number): void {
    this.selecionado = id;
  }

  isQuestionarioSelecionado(id: number): boolean {
    return this.selecionado === id;
  }

  nextStep(): void {
    if (!this.selecionado) {
      console.warn('Selecione um questionário antes de prosseguir');
      return;
    }
    this.etapaAtual++;
    this.mostrarWorkflow = true;
    console.log('Questionário selecionado:', this.selecionado);
  }

  toggle(): void {
    this.resetarModal();
    this.toggleModal.emit();
  }
}
