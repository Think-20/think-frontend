import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';

export type StatusCotista = 'rascunho' | 'pendente' | 'aprovado' | 'cancelado';

export interface CotistaKanban {
  id?: number | string;
  nome_completo?: string;
  nome?: string;
  email?: string;
  documento?: string;
  cpf?: string;
  cnpj?: string;
  status?: string;
  [key: string]: any;
}

export interface CotistaStatusAlterado {
  cotista: CotistaKanban;
  statusAnterior: StatusCotista;
  statusAtual: StatusCotista;
}

@Component({
  selector: 'cb-kanban-cotista',
  templateUrl: './kanban-cotista.component.html',
  styleUrls: [
    '../../cadastro-cedentes/cadastro-cedentes.component.css',
    './kanban-cotista.component.css'
  ]
})
export class KanbanCotistaComponent implements OnChanges, OnInit {
  @Input() cotistas: CotistaKanban[] = [];
  @Output() statusAlterado = new EventEmitter<CotistaStatusAlterado>();

  readonly kanbanStatuses: StatusCotista[] = ['rascunho', 'pendente', 'aprovado', 'cancelado'];
  readonly kanbanConnectedIds: string[] = this.kanbanStatuses;

  rascunhos: CotistaKanban[] = [];
  pendentes: CotistaKanban[] = [];
  aprovados: CotistaKanban[] = [];
  cancelados: CotistaKanban[] = [];
  totalCotistasFiltrados = 0;
  pesquisa = '';

  kanbanColumns: Array<{ status: StatusCotista; label: string; colorId: string; items: CotistaKanban[] }> = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation && navigation.extras && navigation.extras.state;
    if (state && Array.isArray(state['cotistas'])) {
      this.cotistas = state['cotistas'];
    }
    this.organizarCotistas();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.cotistas) {
      this.organizarCotistas();
    }
  }

  drop(event: CdkDragDrop<CotistaKanban[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    const cotista = event.previousContainer.data[event.previousIndex];
    if (!cotista) {
      return;
    }

    const statusAnterior = this.normalizarStatus(cotista.status);
    const statusAtual = this.normalizarStatus(event.container.id);

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
    cotista.status = statusAtual;
    this.statusAlterado.emit({ cotista, statusAnterior, statusAtual });
    this.organizarCotistas();
  }

  atualizarPesquisa(evento: Event): void {
    this.pesquisa = (evento.target as HTMLInputElement).value;
    this.organizarCotistas();
  }

  private organizarCotistas(): void {
    this.rascunhos = [];
    this.pendentes = [];
    this.aprovados = [];
    this.cancelados = [];

    const termoPesquisa = this.normalizarTexto(this.pesquisa);
    const cotistasFiltrados = (this.cotistas || []).filter(cotista => {
      if (!termoPesquisa) {
        return true;
      }

      const textoCotista = [
        cotista.nome_completo,
        cotista.nome,
        cotista.email,
        cotista.documento,
        cotista.cpf,
        cotista.cnpj,
        cotista.id
      ].filter(valor => valor != null && valor !== '').join(' ');

      return this.normalizarTexto(textoCotista).includes(termoPesquisa);
    });

    this.totalCotistasFiltrados = cotistasFiltrados.length;
    cotistasFiltrados.forEach(cotista => {
      const status = this.normalizarStatus(cotista.status);
      cotista.status = status;
      this.obterColuna(status).push(cotista);
    });

    this.kanbanColumns = [
      { status: 'rascunho', label: 'Rascunhos', colorId: 'spanRascunho', items: this.rascunhos },
      { status: 'pendente', label: 'Pendentes', colorId: 'spanPedente', items: this.pendentes },
      { status: 'aprovado', label: 'Aprovados', colorId: 'spanAprovado', items: this.aprovados },
      { status: 'cancelado', label: 'Cancelados', colorId: 'spanCancelado', items: this.cancelados }
    ];
  }

  private normalizarTexto(valor: any): string {
    return String(valor || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  private obterColuna(status: StatusCotista): CotistaKanban[] {
    switch (status) {
      case 'rascunho': return this.rascunhos;
      case 'aprovado': return this.aprovados;
      case 'cancelado': return this.cancelados;
      default: return this.pendentes;
    }
  }

  private normalizarStatus(status: string): StatusCotista {
    const normalizado = String(status || '').trim().toLowerCase();
    switch (normalizado) {
      case 'rascunho': return 'rascunho';
      case 'aprovado': return 'aprovado';
      case 'cancelado':
      case 'cancelados': return 'cancelado';
      case 'pendente':
      case 'pedente':
      default: return 'pendente';
    }
  }

}
