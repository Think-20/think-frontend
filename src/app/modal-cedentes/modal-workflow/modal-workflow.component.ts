import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ModalCedentesStateService } from '../modal-cedentes-state.service';

interface FundoSelecionado {
  id: number;
  nome: string;
  codigo: string;
  categoria: string;
}

interface QuestionarioSelecionado {
  id: number;
  nome: string;
  descricao: string;
  perguntas: number;
}

interface WorkflowOpcao {
  id: number;
  nome: string;
  etapasDescricao: string;
  quantidadeEtapas: number;
}

@Component({
  selector: 'cb-modal-workflow',
  templateUrl: './modal-workflow.component.html',
  styleUrls: ['./modal-workflow.component.css']
})
export class ModalWorkflowComponent implements OnInit {
  @Input() fundoSelecionado: FundoSelecionado | null = null;
  @Input() questionarioSelecionado: QuestionarioSelecionado | null = null;

  @Output() voltarEtapa = new EventEmitter<void>();
  @Output() fecharModal = new EventEmitter<void>();

  workflowSelecionadoId: number | null = null;

  workflows: WorkflowOpcao[] = [
    {
      id: 1,
      nome: 'Workflow Padrão - 6 Etapas',
      etapasDescricao: 'Pendente - Em Avaliação - Inconsistências - Aprovado - Vencidos - Cancelado',
      quantidadeEtapas: 6
    },
    {
      id: 2,
      nome: 'Workflow Simplificado - 4 Etapas',
      etapasDescricao: 'Pendente - Em Análise - Aprovado - Rejeitado',
      quantidadeEtapas: 4
    },
    {
      id: 3,
      nome: 'Workflow Expresso - 5 Etapas',
      etapasDescricao: 'Pendente - Triagem - Em Análise - Aprovado - Finalizado',
      quantidadeEtapas: 5
    }
  ];

  constructor(private modalCedentesStateService: ModalCedentesStateService) { }

  ngOnInit() {
    if (!this.fundoSelecionado) {
      this.fundoSelecionado = this.modalCedentesStateService.fundoSelecionado;
    }

    if (!this.questionarioSelecionado) {
      this.questionarioSelecionado = this.modalCedentesStateService.questionarioSelecionado;
    }
  }

  selecionarWorkflow(id: number): void {
    this.workflowSelecionadoId = id;
  }

  isWorkflowSelecionado(id: number): boolean {
    return this.workflowSelecionadoId === id;
  }

  voltar(): void {
    this.voltarEtapa.emit();
  }

  fechar(): void {
    this.fecharModal.emit();
  }

  confirmarAtivacao(): void {
    if (!this.workflowSelecionadoId) {
      return;
    }

    this.fecharModal.emit();
  }

}
