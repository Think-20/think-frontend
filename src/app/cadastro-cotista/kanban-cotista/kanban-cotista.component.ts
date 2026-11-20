import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export type StatusCotista = 'rascunho' | 'pendente' | 'aprovado' | 'cancelado';

export interface CotistaKanban {
  id?: number | string;
  nome_completo?: string;
  nome?: string;
  email?: string;
  documento?: string;
  cpf?: string;
  cnpj?: string;
  sexo?: string;
  arquivos?: any[];
  cotista_files?: any[];
  suitability?: {
    perfil?: string | null;
    [key: string]: any;
  };
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

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    const navigationState = navigation && navigation.extras && navigation.extras.state;
    const navigationCotistas = navigationState && navigationState['cotistas'];
    const historyState = window.history && window.history.state;
    const historyCotistas = historyState && historyState['cotistas'];
    const cotistas = Array.isArray(navigationCotistas) ? navigationCotistas : historyCotistas;

    if (Array.isArray(cotistas)) {
      this.cotistas = cotistas;
    }
    this.organizarCotistas();
    this.buscarCotistas();
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

    const payload = { ...cotista, enviar: true, status: statusAtual };
    delete payload.arquivos;
    delete payload.cotista_files;
    this.http.patch(
      `${environment.api}/cotista/patch`,
      payload
    ).subscribe({
      error: (erro) => {
        console.error('Erro ao atualizar status do cotista:', erro);
        cotista.status = statusAnterior;
        this.organizarCotistas();
      }
    });
  }

  atualizarPesquisa(evento: Event): void {
    this.pesquisa = (evento.target as HTMLInputElement).value;
    this.organizarCotistas();
  }

  abrirCotista(cotista: CotistaKanban): void {
    if (this.normalizarStatus(cotista.status) !== 'rascunho') {
      return;
    }

    this.router.navigateByUrl('/cadastro-cotista/nova', {
      state: { cotista }
    });
  }

  removerCotista(cotista: CotistaKanban, evento: MouseEvent): void {
    evento.stopPropagation();
    if (cotista.id == null) {
      console.error('Não é possível excluir um cotista sem ID:', cotista);
      return;
    }

    this.http.delete(`${environment.api}/cotista/remove/${cotista.id}`).subscribe({
      next: () => {
        this.cotistas = this.cotistas.filter(item => item !== cotista);
        this.organizarCotistas();
      },
      error: (erro) => {
        console.error('Erro ao excluir cotista:', erro);
      }
    });
  }

  private buscarCotistas(): void {
    this.http.post<{ data?: CotistaKanban[] }>(
      `${environment.api}/cotistas/all`,
      { per_page: 100 }
    ).subscribe({
      next: (resposta) => {
        if (!resposta || !Array.isArray(resposta.data)) {
          console.error('A resposta da busca não contém a lista de cotistas:', resposta);
          return;
        }

        const cotistasInicializados = this.cotistas || [];
        this.cotistas = resposta.data.map(cotista => {
          const cotistaInicial = cotistasInicializados.find(item =>
            item.id != null && cotista.id != null && String(item.id) === String(cotista.id)
          );
          if (!cotistaInicial) {
            return cotista;
          }

          const arquivosResposta = Array.isArray(cotista.arquivos) && cotista.arquivos.length
            ? cotista.arquivos
            : cotista.cotista_files;
          const arquivosIniciais = Array.isArray(cotistaInicial.arquivos) && cotistaInicial.arquivos.length
            ? cotistaInicial.arquivos
            : cotistaInicial.cotista_files;

          if ((!Array.isArray(arquivosResposta) || !arquivosResposta.length) &&
              Array.isArray(arquivosIniciais) && arquivosIniciais.length) {
            return { ...cotista, arquivos: arquivosIniciais };
          }
          return cotista;
        });
        this.organizarCotistas();
      },
      error: (erro) => {
        console.error('Erro ao carregar cotistas:', erro);
      }
    });
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
