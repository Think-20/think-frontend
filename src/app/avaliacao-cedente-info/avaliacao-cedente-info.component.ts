import { Component, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Form, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environment';
import { FundStateService } from '../cadastro-cedentes/fund-state.service';
import { AuthService } from '../login/auth.service';

type AvaliacaoAcao = 'aprovar' | 'corrigir' | 'rejeitar' | null;

@Component({
  selector: 'cb-avaliacao-cedente-info',
  templateUrl: './avaliacao-cedente-info.component.html',
  styleUrls: ['./avaliacao-cedente-info.component.css']
})
export class AvaliacaoCedenteInfoComponent implements OnInit {
  @Input() cedente: any;

  selectedAcao: AvaliacaoAcao = null;
  submitting = false;
  podeVerAcoesAvaliacao = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private fundState: FundStateService,
    private auth: AuthService
  ) { }

  // Formularios
  formAprovacao!: FormGroup;
  formCorrecao!: FormGroup;
  formRejeicao!: FormGroup;

  ngOnInit() {
    this.definirPermissaoAcoesAvaliacao();

    // inicializando os formularios
    this.formAprovacao = this.fb.group({
      limiteAprovado: ['', Validators.required],
      prazoAtualizacao: ['6', Validators.required],
      observacao: ['']
    });
    this.formCorrecao = this.fb.group({
      observacao: ['', Validators.required]
    });
    this.formRejeicao = this.fb.group({
        observacao: ['', Validators.required]
    })
  }

  private definirPermissaoAcoesAvaliacao(): void {
    const roleId = this.obterCedenteRoleIdUsuarioLogado();
    this.podeVerAcoesAvaliacao = roleId === null || roleId === 2 || roleId === 3;
  }

  private obterCedenteRoleIdUsuarioLogado(): number | null {
    const usuario: any = this.auth.currentUser();

    const roleTopLevel = usuario && usuario.cedente_role && usuario.cedente_role.id;
    const roleEmployee = usuario && usuario.employee && usuario.employee.cedente_role && usuario.employee.cedente_role.id;
    const roleRaw = roleTopLevel != null ? roleTopLevel : roleEmployee;

    if (roleRaw === null || roleRaw === undefined || roleRaw === '') {
      return null;
    }

    const roleId = Number(roleRaw);
    return Number.isNaN(roleId) ? null : roleId;
  }

  selecionarAcao(acao: AvaliacaoAcao) {
    this.selectedAcao = this.selectedAcao === acao ? null : acao;
  }

  isAcaoSelecionada(acao: AvaliacaoAcao): boolean {
    return this.selectedAcao === acao;
  }

  enviarAprovacao(): void {
    if (this.formAprovacao.invalid) {
      this.formAprovacao.markAllAsTouched();
      return;
    }

    const valorObservacao = String(this.formAprovacao.value.observacao || '').trim();
    const payload = this.montarPayload('aprovado', valorObservacao, {
      limite_aprovado: this.formAprovacao.value.limiteAprovado,
      prazo_atualizacao_cadastral: Number(this.formAprovacao.value.prazoAtualizacao)
    });

    this.enviarPatch(payload, this.formAprovacao);
  }

  enviarCorrecao(): void {
    if (this.formCorrecao.invalid) {
      this.formCorrecao.markAllAsTouched();
      return;
    }

    const payload = this.montarPayload('solicitar_correcoes', String(this.formCorrecao.value.observacao || '').trim());
    this.enviarPatch(payload, this.formCorrecao);
  }

  enviarRejeicao(): void {
    if (this.formRejeicao.invalid) {
      this.formRejeicao.markAllAsTouched();
      return;
    }

    const payload = this.montarPayloadRejeicao(String(this.formRejeicao.value.observacao || '').trim());
    this.enviarPatch(payload, this.formRejeicao);
  }

  private enviarPatch(payload: any, form: FormGroup): void {
    const url = `${environment.api}/cedente/avaliacao`;

    this.submitting = true;

    this.http.patch(url, payload).subscribe({
      next: (res: any) => {
        console.log('Avaliação enviada com sucesso:', res);
        this.selectedAcao = null;
        form.reset();
        this.submitting = false;
      },
      error: (err) => {
        console.error('Erro ao enviar avaliação:', err);
        this.submitting = false;
      }
    });
  }

  private montarPayload(resultado: string, observacao: string, extras?: { [key: string]: any }): any {
    const cedenteId = this.obterCedenteId();
    const fundId = this.obterFundId();

    const payload: any = {
      fund_id: fundId,
      id: cedenteId,
      resultado,
      observacao
    };

    if (extras) {
      Object.keys(extras).forEach((key) => {
        payload[key] = extras[key];
      });
    }

    return payload;
  }

  private montarPayloadRejeicao(observacao: string): any {
    const cedenteId = this.obterCedenteId();
    const fundId = this.obterFundId();

    return {
      fund_id: fundId,
      id: cedenteId,
      resultado: 'rejeitado',
      observacao
    };
  }

  private obterCedenteId(): number | null {
    const id = this.cedente && (this.cedente.id || this.cedente.cedente_id || this.cedente.cedenteId);

    if (id === null || id === undefined || id === '') {
      return null;
    }

    const numericId = Number(id);
    return Number.isNaN(numericId) ? null : numericId;
  }

  private obterFundId(): number | null {
    const doCedente = this.cedente && (this.cedente.fund_id || this.cedente.fundo_id || this.cedente.fundId);
    const daRota = this.route.snapshot.paramMap.get('id') || (this.route.parent ? this.route.parent.snapshot.paramMap.get('id') : null);
    const doEstado = this.fundState.currentFundId;
    const valor = doCedente || daRota || doEstado;

    if (valor === null || valor === undefined || valor === '') {
      return null;
    }

    const numericId = Number(valor);
    return Number.isNaN(numericId) ? null : numericId;
  }

}
