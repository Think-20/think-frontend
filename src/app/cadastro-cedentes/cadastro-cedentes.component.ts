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
    const cedentesFiltrados = this.aplicarFiltros(cedentesBase);
    this.totalCadastrosFiltrados = cedentesFiltrados.length;

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
    const pesquisa = this.getValorCampo('pesquisa').toLowerCase();
    const consultoria = this.getValorCampo('consultoria').toLowerCase();
    const responsavel = this.getValorCampo('responsavel').toLowerCase();
    const slaVencido = this.getValorSlaVencido();

    return cedentesBase.filter((cedente: any) => {
      const textoPesquisa = [
        cedente && cedente.nome,
        cedente && cedente.razao_social,
        cedente && cedente.documento,
        cedente && cedente.cnpj,
        cedente && cedente.id
      ].filter((valor: any) => valor != null && valor !== '').join(' ').toLowerCase();

      const atendePesquisa = !pesquisa || textoPesquisa.includes(pesquisa);

      const consultoriaCedente = String(
        (cedente && (cedente.consultoria || cedente.consultoria_nome)) || ''
      ).toLowerCase();
      const atendeConsultoria = !consultoria || consultoriaCedente.includes(consultoria);

      const responsavelCedente = String(
        (cedente && (cedente.responsavel_nome || cedente.responsavel || (cedente.pessoas_vinculadas && cedente.pessoas_vinculadas[0] && cedente.pessoas_vinculadas[0].nome) || '')) || ''
      ).toLowerCase();
      const atendeResponsavel = !responsavel || responsavelCedente.includes(responsavel);

      const atendeSla = !slaVencido || this.isSlaVencido(cedente);

      return atendePesquisa && atendeConsultoria && atendeResponsavel && atendeSla;
    });
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
    const payload = { id, status: backendStatus };

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
