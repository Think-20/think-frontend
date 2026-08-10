import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { environment } from '../../environments/environment.prod';
import { ActivatedRoute, Router} from '@angular/router';
import { FundStateService } from './fund-state.service';
import { CedenteDataService } from './novo-cedente/cedente-data.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ListCedentesComponent } from './list-cedentes/list-cedentes.component';

@Component({
  selector: 'cb-cadastro-cedentes',
  templateUrl: './cadastro-cedentes.component.html',
  styleUrls: ['./cadastro-cedentes.component.css']
})
export class CadastroCedentesComponent implements OnInit {
  readonly filtroSemResponsavelValor = '__SEM_RESPONSAVEL__';

  fundo: any;
  cedentes: any;
  fund_id: string | null = null;
  mostrarKanban: boolean = true;
  mostrarNovoCedente: boolean = false;
  layoutMode: 'kanban' | 'list' = 'kanban';

  // Arrays para o Kanban
  rascunho: any[] = [];
  pendentes: any[] = [];
  emAvaliacao: any[] = [];
  inconsistente: any[] = [];
  aprovados: any[] = [];
  vencidos: any[] = [];
  cancelados: any[] = [];
  totalCadastrosFiltrados = 0;
  consultoriasDisponiveis: string[] = [];
  responsaveisDisponiveis: string[] = [];
  exibirOpcaoSemResponsavel = false;
  mensagemFiltroRelacionamento = '';

  // formulario
  formBusca!: FormGroup;
  formFiltroSla!: FormGroup;

  kanbanStatuses = ['rascunho','pendente', 'em_avaliacao', 'inconsistente', 'aprovado', 'vencido', 'cancelado'];

  kanbanColumns: Array<{ status: string; label: string; items: any[]; colorId: string }> = [];
  kanbanConnectedIds = this.kanbanStatuses;

  cadastroSucesso = false;
  mostrarInfoCedente = false;
  cedenteSelecionado: any = null;
  isLoading = false;

  @ViewChild(ListCedentesComponent, { static: false })
  listCedentesComponent?: ListCedentesComponent;


  private updateKanbanColumns() {
    const mostrarTodasAsColunas = !this.temFiltroAtivo();

    this.kanbanColumns = [
      {status: 'rascunho', label: 'Rascunho', items: this.rascunho, colorId:'spanRascunho'},
      { status: 'pendente', label: 'Pendente', items: this.pendentes, colorId: 'spanPedente' },
      { status: 'em_avaliacao', label: 'Em Avaliação', items: this.emAvaliacao, colorId: 'spanAvaliacao' },
      { status: 'inconsistente', label: 'Inconsistencia', items: this.inconsistente, colorId: 'spanInconsistencia' },
      { status: 'aprovado', label: 'Aprovados', items: this.aprovados, colorId: 'spanAprovado' },
      { status: 'vencido', label: 'Vencidos', items: this.vencidos, colorId: 'spanVencidos' },
      { status: 'cancelado', label: 'Cancelados', items: this.cancelados, colorId: 'spanCancelado' }
    ].filter(column => mostrarTodasAsColunas || column.items.length > 0);
  }

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient, 
    private route: ActivatedRoute,
    private router: Router,
    private fundState: FundStateService,
    private cedenteDataService: CedenteDataService
  ) { }
  
  ngOnInit() {

    const navigation = this.router.getCurrentNavigation();
    if (
      navigation &&
      navigation.extras &&
      navigation.extras.state &&
      navigation.extras.state['cadastroSucesso']
    ) {
      this.cadastroSucesso = true;
      this.mostrarNovoCedente = false;
      this.mostrarKanban = true;
      this.layoutMode = 'kanban';
      this.voltarKanban();
      setTimeout(() => {
        this.cadastroSucesso = false;
      }, 4000);
    }

    this.formBusca = this.fb.group({
      pesquisa:[''],
      consultoria:[''],
      responsavel:['']
    });

    this.formFiltroSla = this.fb.group({
      SLAVencido:[false]
    });

    this.formBusca.valueChanges.subscribe(() => {
      this.organizarCedentes();
    });

    this.formFiltroSla.valueChanges.subscribe(() => {
      this.organizarCedentes();
    });

    const id = this.route.snapshot.paramMap.get('id');
    this.fund_id = id;
    this.fundState.setFundId(id);
    if (id) {
      this.cedenteDataService.setFundId(id);
    }

    this.updateKanbanColumns();
    this.buscarFund(id);
    this.buscarCedentes();
    
  }

  abrirNovoCedente(){
    this.isLoading = true;
    this.cedenteDataService.resetarDados();
    this.cedenteDataService.setFundId(this.fund_id);
    this.mostrarKanban = false;
    this.mostrarNovoCedente = false;

    window.setTimeout(() => {
      this.mostrarNovoCedente = true;
      this.isLoading = false;
    }, 250);
  }

  abrirInfoCedente(cedente: any) {
    if (this.isRascunhoStatus(cedente && cedente.status)) {
      this.abrirRascunho(cedente);
      return;
    }

    const cedenteId = cedente && cedente.id != null ? String(cedente.id) : null;
    this.cedenteDataService.setCedenteId(cedenteId);

    if (!cedenteId) {
      this.cedenteSelecionado = cedente;
      this.mostrarKanban = false;
      this.mostrarNovoCedente = false;
      this.mostrarInfoCedente = true;
      return;
    }

    this.buscarDetalhesCedente(cedenteId).subscribe((detalhes: any) => {
      const cedenteCompleto = detalhes
        ? {
            ...cedente,
            ...detalhes,
            endereco: detalhes.endereco || cedente.endereco,
            cedente_files: detalhes.cedente_files || detalhes.arquivos || cedente.cedente_files || cedente.arquivos || []
          }
        : {
            ...cedente,
            cedente_files: cedente.cedente_files || cedente.arquivos || []
          };

      this.cedenteSelecionado = cedenteCompleto;
      this.mostrarKanban = false;
      this.mostrarNovoCedente = false;
      this.mostrarInfoCedente = true;
      this.isLoading = false;
    });
  }

  private abrirRascunho(cedente: any) {
    const cedenteId = cedente && cedente.id != null ? String(cedente.id) : null;

    if (!cedenteId) {
      this.cedenteDataService.carregarCedenteExistente(cedente, this.fund_id);
      this.mostrarInfoCedente = false;
      this.mostrarKanban = false;
      this.mostrarNovoCedente = true;
      return;
    }

    this.buscarDetalhesCedente(cedenteId).subscribe((detalhes: any) => {
      const cedenteCompleto = detalhes
        ? {
            ...cedente,
            ...detalhes,
            endereco: detalhes.endereco || cedente.endereco
          }
        : cedente;

      this.cedenteDataService.carregarCedenteExistente(cedenteCompleto, this.fund_id);
      this.mostrarInfoCedente = false;
      this.mostrarKanban = false;
      this.mostrarNovoCedente = true;
      this.isLoading = false;
    });
  }

  private buscarDetalhesCedente(cedenteId: string): Observable<any> {
    const queryFund = this.fund_id ? `?fund_id=${this.fund_id}` : '';
    const endpoints = [
      `${environment.api}/cedente/get/${cedenteId}${queryFund}`,
      `${environment.api}/cedentes/get/${cedenteId}${queryFund}`,
      `${environment.api}/cedentes/${cedenteId}${queryFund}`
    ];

    return this.tentarBuscarDetalhes(endpoints, 0);
  }

  private tentarBuscarDetalhes(endpoints: string[], index: number): Observable<any> {
    if (index >= endpoints.length) {
      return of(null);
    }

    return this.http.get(endpoints[index]).pipe(
      map((res: any) => this.extrairCedenteDaResposta(res)),
      catchError(() => this.tentarBuscarDetalhes(endpoints, index + 1))
    );
  }

  private extrairCedenteDaResposta(res: any): any {
    if (!res) {
      return null;
    }

    if (res.data && !Array.isArray(res.data)) {
      return res.data;
    }

    if (res.cedente) {
      return res.cedente;
    }

    return res;
  }

  voltarKanban(){
    this.isLoading = true;
    this.mostrarKanban = false;
    this.mostrarNovoCedente = false;
    this.mostrarInfoCedente = false;

    this.buscarCedentes(undefined, () => {
      this.mostrarKanban = true;
      this.finalizarCarregamento();
    });
  }

  editarCedenteSelecionado() {
    if (!this.cedenteSelecionado) {
      return;
    }

    this.isLoading = true;
    this.mostrarKanban = false;
    this.mostrarNovoCedente = false;
    this.mostrarInfoCedente = false;

    this.cedenteDataService.carregarCedenteExistente(this.cedenteSelecionado, this.fund_id);
    this.cedenteDataService.setCedenteId(
      this.cedenteSelecionado && this.cedenteSelecionado.id != null ? String(this.cedenteSelecionado.id) : null
    );

    setTimeout(() => {
      this.mostrarNovoCedente = true;
      this.isLoading = false;
    }, 300);
  }

  // trocarFundo() {
  //   this.router.navigate(['/cedente']);
  // }

  alternarLayout(mode: 'kanban' | 'list') {
    this.layoutMode = mode;
  }

  // url API
  buscarFund(id:any) {
    this.isLoading = true;
    if (!id) {
      console.warn('Nenhum fundo selecionado para buscarFund');
      return;
    }

    const url = `${environment.api}/funds/get/${id}`;
    this.fundo = {
      id: 1,
      name: 'nome',
      type: 'FIDC',
      code: 'FIDC-EXM-01',
      quantidade_cedente: '1000.5000',
      is_active: true,
      deactivated_at: null,
      created_at: '2026-04-29 23:38:46',
      updated_at: '2026-04-29 23:38:46'
    };

    this.http.get(url).subscribe({
      next: (res: any) => {
        console.log(res);
        this.fundo = res;
        this.isLoading = false;
      },
      error: (err) => {
        console.log(err);
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  // url API
  cadastrarCedente(data: any) {
    const statusSalvo = this.normalizeStatus(
      data && (data.status || (data.data && data.data.status) || (data.cedente && data.cedente.status))
    );

    this.cadastroSucesso = statusSalvo === 'pendente';
    this.atualizarTelaAposCadastro();

    if (this.cadastroSucesso) {
      setTimeout(() => {
        this.cadastroSucesso = false;
      }, 4000);
    }
  }

  finalizarCadastroComRefresh() {
    this.cadastroSucesso = true;
    this.atualizarTelaAposCadastro();

    setTimeout(() => {
      this.cadastroSucesso = false;
    }, 4000);
  }

  private atualizarTelaAposCadastro() {
    this.buscarCedentes();

    if (this.listCedentesComponent) {
      this.listCedentesComponent.buscarCedentes();
    }

    this.voltarKanban();
  }
  
  buscarCedentes(query?: string, onComplete?: () => void) {
    const url = `${environment.api}/cedentes/all`;
    const queryText = query && query.trim() ? query.trim() : '';
    const pesquisaControl = this.formBusca.get('pesquisa');
    const pesquisaValue = pesquisaControl && pesquisaControl.value ? String(pesquisaControl.value).trim() : '';
    const pesquisa = queryText || pesquisaValue;

    const body: any = {
      fund_id: this.fund_id
    };

    if (pesquisa) {
      body.pesquisa = pesquisa;
    }

    this.isLoading = true;

    this.http.post(url, body).subscribe({
      next: (res: any) => {
        this.cedentes = res;
        this.organizarCedentes();
        this.finalizarCarregamento(onComplete);
      },
      error: (err) => {
        console.error(err);
        this.organizarCedentes();
        this.finalizarCarregamento(onComplete);
      }
    });
  }

  private finalizarCarregamento(onComplete?: () => void) {
    window.setTimeout(() => {
      this.isLoading = false;
      if (onComplete) {
        onComplete();
      }
    }, 0);
  }

  organizarCedentes() {
    this.rascunho = [];
    this.pendentes = [];
    this.emAvaliacao = [];
    this.inconsistente = [];
    this.aprovados = [];
    this.vencidos = [];
    this.cancelados = [];

    const cedentesBase = this.obterCedentesBase();
    this.atualizarOpcoesFiltros(cedentesBase);
    const cedentesFiltrados = this.aplicarFiltros(cedentesBase);
    this.totalCadastrosFiltrados = cedentesFiltrados.length;
    this.atualizarMensagemFiltroRelacionamento();

    cedentesFiltrados.forEach((cedente: any) => {
      const normalizedStatus = String(cedente.status || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_');

      switch (normalizedStatus) {
        case 'rascunho':
          this.rascunho.push(cedente);
          break;
        case 'pendente':
          this.pendentes.push(cedente);
          break;
        case 'em_avaliacao':
          this.emAvaliacao.push(cedente);
          break;
        case 'inconsistente':
          this.inconsistente.push(cedente);
          break;
        case 'aprovado':
          this.aprovados.push(cedente);
          break;
        case 'vencido':
          this.vencidos.push(cedente);
          break;
        case 'cancelado':
          this.cancelados.push(cedente);
          break;
        default:
          this.pendentes.push(cedente);
      }
    });

    this.updateKanbanColumns();
  }

  private atualizarOpcoesFiltros(cedentesBase: any[]): void {
    const consultorias = new Map<string, string>();
    const responsaveis = new Map<string, string>();
    this.exibirOpcaoSemResponsavel = false;

    cedentesBase.forEach((cedente: any) => {
      const consultoria = this.extrairConsultoriaCedente(cedente);
      const responsaveisCedente = this.extrairResponsaveisCedente(cedente);

      this.adicionarOpcaoUnica(consultorias, consultoria);

      responsaveisCedente.forEach((nome: string) => {
        this.adicionarOpcaoUnica(responsaveis, nome);
      });

      if (!responsaveisCedente.length) {
        this.exibirOpcaoSemResponsavel = true;
      }
    });

    this.consultoriasDisponiveis = Array.from(consultorias.values()).sort((a: string, b: string) => a.localeCompare(b, 'pt-BR'));
    this.responsaveisDisponiveis = Array.from(responsaveis.values()).sort((a: string, b: string) => a.localeCompare(b, 'pt-BR'));
  }

  private obterCedentesBase(): any[] {
    if (this.cedentes && Array.isArray(this.cedentes.data)) {
      return this.cedentes.data;
    }

    if (Array.isArray(this.cedentes)) {
      return this.cedentes;
    }

    return [];
  }

  private aplicarFiltros(cedentesBase: any[]): any[] {
    const pesquisa = this.normalizarTextoFiltro(this.getValorCampo('pesquisa'));
    const consultoria = this.normalizarTextoFiltro(this.getValorCampo('consultoria'));
    const responsavelSelecionado = this.getValorCampo('responsavel');
    const responsavel = this.normalizarTextoFiltro(responsavelSelecionado);
    const filtrarSemResponsavel = responsavelSelecionado === this.filtroSemResponsavelValor;
    const slaVencido = this.getValorSlaVencido();

    return cedentesBase.filter((cedente: any) => {
      const textoPesquisa = [
        cedente && cedente.nome,
        cedente && cedente.razao_social,
        cedente && cedente.documento,
        cedente && cedente.cnpj,
        cedente && cedente.id
      ].filter((valor: any) => valor != null && valor !== '').join(' ');
      const textoPesquisaNormalizado = this.normalizarTextoFiltro(textoPesquisa);

      const atendePesquisa = !pesquisa || textoPesquisaNormalizado.includes(pesquisa);

      const consultoriaCedente = this.normalizarTextoFiltro(this.extrairConsultoriaCedente(cedente));
      const atendeConsultoria = !consultoria || consultoriaCedente.includes(consultoria);

      const responsaveisCedente = this.extrairResponsaveisCedente(cedente)
        .map((nome: string) => this.normalizarTextoFiltro(nome))
        .filter((nome: string) => !!nome);

      let atendeResponsavel = true;
      if (filtrarSemResponsavel) {
        atendeResponsavel = responsaveisCedente.length === 0;
      } else if (responsavel) {
        atendeResponsavel = responsaveisCedente.some((nome: string) => (
          nome.includes(responsavel) || responsavel.includes(nome)
        ));
      }

      const atendeSla = !slaVencido || this.isSlaVencido(cedente);

      return atendePesquisa && atendeConsultoria && atendeResponsavel && atendeSla;
    });
  }

  private atualizarMensagemFiltroRelacionamento(): void {
    const consultoriaSelecionada = this.getValorCampo('consultoria');
    const responsavelSelecionado = this.getValorCampo('responsavel');
    const temFiltroRelacionamento = !!consultoriaSelecionada || !!responsavelSelecionado;

    if (temFiltroRelacionamento && this.totalCadastrosFiltrados === 0) {
      this.mensagemFiltroRelacionamento = 'A consultoria ou o responsável informado não se condiz com os cedentes cadastrados.';
      return;
    }

    this.mensagemFiltroRelacionamento = '';
  }

  private extrairConsultoriaCedente(cedente: any): string {
    const consultoria =
      (cedente && (
        cedente.consultoria_nome ||
        cedente.nome_consultoria ||
        cedente.nomeConsultoria ||
        (cedente.consultoria && (cedente.consultoria.nome || cedente.consultoria.name || cedente.consultoria.descricao)) ||
        cedente.consultoria ||
        cedente.nome
      )) || '';

    return this.normalizarOpcaoFiltro(consultoria);
  }

  private extrairResponsavelCedente(cedente: any): string {
    const responsaveis = this.extrairResponsaveisCedente(cedente);
    return responsaveis.length ? responsaveis[0] : '';
  }

  private extrairResponsaveisCedente(cedente: any): string[] {
    const candidatos: any[] = [];

    if (cedente) {
      candidatos.push(cedente.responsavel_nome);
      candidatos.push(cedente.responsavel && (cedente.responsavel.nome || cedente.responsavel.name));

      // Só usa "responsavel" textual (evita IDs numéricos que derrubam o filtro por nome).
      if (typeof cedente.responsavel === 'string' && !/^\d+$/.test(cedente.responsavel.trim())) {
        candidatos.push(cedente.responsavel);
      }

      if (Array.isArray(cedente.pessoas_vinculadas)) {
        cedente.pessoas_vinculadas.forEach((p: any) => {
          candidatos.push(p && (p.nome || p.name));
        });
      }

      if (Array.isArray(cedente.responsaveis)) {
        cedente.responsaveis.forEach((r: any) => {
          candidatos.push(r && (r.nome || r.name));
        });
      }
    }

    const unicos = new Map<string, string>();
    candidatos.forEach((valor: any) => {
      const nome = this.normalizarOpcaoFiltro(valor);
      if (!nome) {
        return;
      }

      const chave = nome.toLowerCase();
      if (!unicos.has(chave)) {
        unicos.set(chave, nome);
      }
    });

    return Array.from(unicos.values());
  }

  private adicionarOpcaoUnica(mapa: Map<string, string>, valor: string): void {
    const normalizado = this.normalizarOpcaoFiltro(valor);
    if (!normalizado) {
      return;
    }

    const chave = normalizado.toLowerCase();
    if (!mapa.has(chave)) {
      mapa.set(chave, normalizado);
    }
  }

  private normalizarOpcaoFiltro(valor: any): string {
    const texto = String(valor || '').trim();
    if (!texto) {
      return '';
    }

    const invalidos = ['-', '---', 'não informado', 'nao informado', 'null', 'undefined'];
    return invalidos.includes(texto.toLowerCase()) ? '' : texto;
  }

  private normalizarTextoFiltro(valor: any): string {
    return String(valor || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase();
  }

  private getValorCampo(controlName: string): string {
    const control = this.formBusca && this.formBusca.get(controlName);
    return control && control.value ? String(control.value).trim() : '';
  }

  private getValorSlaVencido(): boolean {
    const control = this.formFiltroSla && this.formFiltroSla.get('SLAVencido');
    return !!(control && control.value === true);
  }

  private temFiltroAtivo(): boolean {
    return !!this.getValorCampo('pesquisa') || !!this.getValorCampo('consultoria') || !!this.getValorCampo('responsavel') || this.getValorSlaVencido();
  }

  private isSlaVencido(cedente: any): boolean {
    if (!cedente || !cedente.sla) {
      return false;
    }

    const dataSla = new Date(cedente.sla);
    if (Number.isNaN(dataSla.getTime())) {
      return false;
    }

    return dataSla < new Date();
  }

  drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Armazenar dados para possível rollback
      const cedente = event.previousContainer.data[event.previousIndex];
      if (this.isRascunhoStatus(cedente && cedente.status)) {
        return;
      }

      const containerOrigem = event.previousContainer;
      const containerDestino = event.container;
      const indexOrigem = event.previousIndex;
      const indexDestino = event.currentIndex;

      // Fazer a movimentação no frontend (temporária)
      transferArrayItem(
        containerOrigem.data,
        containerDestino.data,
        indexOrigem,
        indexDestino,
      );

      // Obter o novo status e fazer a requisição
      const novoStatus = this.getStatusFromId(containerDestino.id);
      this.atualizarStatusCedente(cedente.id, novoStatus, {
        containerOrigem,
        containerDestino,
        indexOrigem,
        indexDestino,
        cedente
      });
    }
  }

  getStatusFromId(id: string): string {
    switch (id) {
      case 'rascunho': return 'rascunho';
      case 'pendente': return 'pendente';
      case 'em_avaliacao': return 'em_avaliacao';
      case 'inconsistente': return 'inconsistente';
      case 'aprovado': return 'aprovado';
      case 'vencido': return 'vencido';
      case 'cancelado': return 'cancelado';
      default: return 'pendente';
    }
  }

  atualizarStatusCedente(id: number, status: string, rollbackData?: any) {
    const url = `${environment.api}/cedente/patch`;
    const backendStatus = this.normalizeBackendStatus(status);
    const payload = {
      id,
      status: backendStatus,
      fund_id: this.fund_id,
      fundo_id: this.fund_id
    };

    this.http.patch(url, payload).subscribe({
      next: (res: any) => {
        console.log('Status atualizado com sucesso:', res);
      },
      error: (err) => {
        console.error('Erro ao atualizar status:', err);

        // Fazer rollback se houver dados de reversão
        if (rollbackData) {
          const { containerOrigem, containerDestino, indexOrigem, indexDestino, cedente } = rollbackData;
          
          // Reverter a movimentação no frontend
          transferArrayItem(
            containerDestino.data,
            containerOrigem.data,
            containerDestino.data.indexOf(cedente),
            indexOrigem
          );

          console.log('Card revertido para posição original');
        }
      }
    });
  }

  normalizeBackendStatus(status: string): string {
    const normalized = String(status).trim().toLowerCase();
    if (normalized === 'inconsistente') {
      return 'inconsistente';
    }
    return normalized;
  }

  private normalizeStatus(status: any): string {
    return String(status || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_');
  }

  isRascunhoStatus(status: any): boolean {
    return this.normalizeStatus(status) === 'rascunho';
  }

  trocarFundo(){
    this.router.navigate(['/cedente']);
  }



}
