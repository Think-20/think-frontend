import { Injectable } from '@angular/core';

export interface FundoSelecionadoState {
  id: number;
  nome: string;
  codigo: string;
  categoria: string;
}

export interface QuestionarioSelecionadoState {
  id: number;
  nome: string;
  descricao: string;
  perguntas: number;
}

@Injectable({
  providedIn: 'root'
})
export class ModalCedentesStateService {
  fundoSelecionado: FundoSelecionadoState | null = null;
  questionarioSelecionado: QuestionarioSelecionadoState | null = null;

  reset(): void {
    this.fundoSelecionado = null;
    this.questionarioSelecionado = null;
  }
}
