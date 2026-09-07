import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment.prod';
import { FundStateService } from '../cadastro-cedentes/fund-state.service';
import { CedenteDataService } from '../cadastro-cedentes/novo-cedente/cedente-data.service';
import { UserService } from '../user/user.service';

@Component({
  selector: 'cb-historico-cedente-info',
  templateUrl: './historico-cedente-info.component.html',
  styleUrls: ['./historico-cedente-info.component.css']
})
export class HistoricoCedenteInfoComponent implements OnInit {
  @Input() cedente: any = null;

  historico: any = null;
  loading = false;
  error: string | null = null;

  private userNames: { [id: string]: string } = {};
  private requestedUserIds: { [id: string]: boolean } = {};

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private fundState: FundStateService,
    private cedenteDataService: CedenteDataService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.carregarHistorico();
  }

  get historicoItems(): any[] {
    if (Array.isArray(this.historico)) {
      return this.historico;
    }

    if (this.historico && Array.isArray(this.historico.data)) {
      return this.historico.data;
    }

    return [];
  }

  trackByHistoricoId(index: number, item: any): any {
    return item && item.id ? item.id : index;
  }

  getTimelineClass(item: any): string {
    if (item && item.event === 'status_alterado') {
      return this.getStatusClass(item.new_status);
    }

    if (item && item.event === 'cadastro_criado') {
      return 'success';
    }

    return 'info';
  }

  getTimelineIcon(item: any): string {
    if (item && item.event === 'status_alterado') {
      return 'sync_alt';
    }

    if (item && item.event === 'cadastro_criado') {
      return 'assignment_turned_in';
    }

    return 'history';
  }

  getTimelineTitle(item: any): string {
    if (item && item.event === 'status_alterado') {
      return `Status alterado para ${this.formatStatus(item.new_status)}`;
    }

    if (item && item.event === 'cadastro_criado') {
      return 'Cadastro criado';
    }

    return this.humanizeEvent(item && item.event);
  }

  getTimelineDescription(item: any): string {
    if (item && item.event === 'status_alterado') {
      const oldStatus = this.formatStatus(item.old_status);
      const newStatus = this.formatStatus(item.new_status);
      return `Cadastro movido de ${oldStatus} para ${newStatus}.`;
    }

    if (item && item.event === 'cadastro_criado') {
      return 'Cadastro inicial submetido para avaliação.';
    }

    return 'Atividade registrada no histórico do cedente.';
  }

  getAuthor(item: any): string {
    if (!item) {
      return 'por Sistema';
    }

    const embeddedName = this.extractEmbeddedUserName(item);
    if (embeddedName) {
      return `por ${embeddedName}`;
    }

    const userId = item.user_id;
    if (!userId) {
      return 'por Sistema';
    }

    const cachedName = this.userNames[userId];
    return cachedName ? `por ${cachedName}` : `por usuário ${userId}`;
  }

  private extractEmbeddedUserName(item: any): string | null {
    const user = item.user || item.usuario;

    if (user && user.employee && user.employee.name) {
      return user.employee.name;
    }

    if (user && user.name) {
      return user.name;
    }

    return item.user_name || item.usuario_nome || item.author_name || null;
  }

  private carregarNomesUsuarios() {
    this.historicoItems.forEach((item) => {
      const userId = item && item.user_id;

      if (!userId || this.userNames[userId] || this.requestedUserIds[userId] || this.extractEmbeddedUserName(item)) {
        return;
      }

      this.requestedUserIds[userId] = true;

      this.userService.user(userId).subscribe(
        (user: any) => {
          const name = (user && user.employee && user.employee.name)
            || (user && user.name)
            || (user && user.email)
            || null;

          if (name) {
            this.userNames[userId] = name;
          }
        },
        () => {
          // Mantém o id como fallback caso não seja possível obter o nome.
        }
      );
    });
  }

  formatDate(value: any): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return String(value);
    }

    const datePart = date.toLocaleDateString('pt-BR');
    const timePart = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return `${datePart} às ${timePart}`;
  }

  private getStatusClass(status: string): string {
    const normalized = String(status || '').trim().toLowerCase();

    switch (normalized) {
      case 'aprovado':
        return 'approved';
      case 'inconsistente':
        return 'warning';
      case 'vencido':
      case 'cancelado':
        return 'danger';
      case 'em_avaliacao':
        return 'info';
      case 'pendente':
      default:
        return 'success';
    }
  }

  private formatStatus(status: string): string {
    const normalized = String(status || '').trim().toLowerCase();

    switch (normalized) {
      case 'em_avaliacao':
        return 'Em Avaliação';
      case 'aprovado':
        return 'Aprovado';
      case 'inconsistente':
        return 'Inconsistente';
      case 'pendente':
        return 'Pendente';
      case 'vencido':
        return 'Vencido';
      case 'cancelado':
        return 'Cancelado';
      default:
        return this.humanizeEvent(normalized);
    }
  }

  private humanizeEvent(event: string): string {
    return String(event || 'evento')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  private carregarHistorico() {
    const cedenteId = (this.cedente && this.cedente.id)
      || this.route.snapshot.paramMap.get('id')
      || this.route.snapshot.queryParamMap.get('id')
      || this.route.snapshot.queryParamMap.get('cedenteId')
      || this.cedenteDataService.getCedenteId();

    const fundId = this.route.snapshot.queryParamMap.get('fund_id')
      || this.fundState.currentFundId;

    if (!cedenteId) {
      this.error = 'ID do cedente não encontrado para carregar o histórico.';
      return;
    }

    if (!fundId) {
      this.error = 'ID do fundo não encontrado para carregar o histórico.';
      return;
    }

    const url = `${environment.api}/cedentes/historico/${cedenteId}?fund_id=${fundId}`;

    this.loading = true;
    this.error = null;

    this.http.get(url).subscribe({
      next: (res: any) => {
        this.historico = res;
        this.loading = false;
        this.carregarNomesUsuarios();
      },
      error: (err) => {
        console.error('Erro ao carregar histórico do cedente:', err);
        this.error = 'Não foi possível carregar o histórico do cedente.';
        this.loading = false;
      }
    });
  }

}
