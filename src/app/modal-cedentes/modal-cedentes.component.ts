import { Component, OnInit, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';

interface FundoOpcao {
  id: number;
  nome: string;
  codigo: string;
  categoria: string;
}

@Component({
  selector: 'cb-modal-cedentes',
  templateUrl: './modal-cedentes.component.html',
  styleUrls: ['./modal-cedentes.component.css']
})
export class ModalCedentesComponent implements OnInit {
  @Output() toggleModal = new EventEmitter<void>();

  mostrarQuestionario: boolean = false;
  selecionado: number | null = null;

  fundos: FundoOpcao[] = [
    { id: 1, nome: 'Fundo de Renda Fixa Epsilon', codigo: 'FRF-005', categoria: 'Renda Fixa' },
    { id: 2, nome: 'Fundo de Infraestrutura Zeta', codigo: 'FIN-0046', categoria: 'Infraestrutura' },
    { id: 3, nome: 'Fundo FIDC Theta', codigo: 'FIDC-007', categoria: 'FIDC' },
    { id: 4, nome: 'Fundo de Investimento Kappa', codigo: 'FIV-008', categoria: 'Investimento' }
  ];

  constructor() { }


  ngOnInit() {
  }

  toggle(): void {
    this.toggleModal.emit();
  }

  get fundoSelecionado(): FundoOpcao | null {
    return this.fundos.find((fundo) => fundo.id === this.selecionado) || null;
  }

  choiceBackground(id: number): void {
    this.selecionado = id;
  }

  nextStep(): void {
    if (this.selecionado != null) {
      this.mostrarQuestionario = true;
    } else {
      console.log('Selecione um fundo primeiro');
    }
  }

  voltarParaPasso1(): void {
    this.mostrarQuestionario = false;
  }

}
