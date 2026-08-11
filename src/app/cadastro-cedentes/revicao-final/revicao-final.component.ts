import { Component, EventEmitter, OnInit, OnDestroy, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CedenteDataService } from '../novo-cedente/cedente-data.service';
import { environment } from '../../../environments/environment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { FundStateService } from '../fund-state.service';

interface EditarDestino {
  etapa: number;
  secao?: 'dados-cadastrais' | 'documentacao' | 'partes-relacionadas' | 'contas-desembolso' | 'avalistas';
}

@Component({
  selector: 'cb-revicao-final',
  templateUrl: './revicao-final.component.html',
  styleUrls: ['./revicao-final.component.css']
})
export class RevicaoFinalComponent implements OnInit, OnDestroy {
  private readonly tamanhoMaximoArquivoBytes = 700 * 1024;
  private readonly tamanhoMaximoArquivoLabel = '700 KB';
  mensagemAlertaSubmissao: string = '';

  dados: any = {
    nome: '',
    documento: '',
    email: '',
    faturamento_anual: null,
    minimo_assinantes: null,
    sistema_financeiro_nacional: false,
    telefone: '',
    endereco: {},
    partes_relacionadas: [],
    avalistas: [],
    contas_desembolso: [],
    arquivos: []
  };

  submitting = false;
  private destroy$ = new Subject<void>();

  @Output() submitConcluido = new EventEmitter<void>();
  @Output() editarEtapaSelecionada = new EventEmitter<EditarDestino>();

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private cedenteDataService: CedenteDataService,
    private route: ActivatedRoute,
    private fundState: FundStateService
  ) { }

  private fundoId: string | null = null;
  
  ngOnInit() {
    
    // Subscribe aos dados do serviço para atualizar em tempo real
    this.cedenteDataService.obterDados$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((dados) => {
        console.log('Dados ATUALIZADOS =>', dados);
        this.dados = { ...dados };
      });

    const idDaRota = this.route.snapshot.paramMap.get('id');
    const idDoPai = this.route.parent ? this.route.parent.snapshot.paramMap.get('id') : null;

    this.fundoId = idDaRota || idDoPai || this.fundState.currentFundId;
    this.cedenteDataService.setFundId(this.fundoId);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Submeter cadastro completo
   */
  async submeterCadastro() {
    if (this.submitting) return;

    this.mensagemAlertaSubmissao = '';
    
    this.submitting = true;
    this.dispatchLoading(true);

    try {
      
      
      const idAtual =
        this.fundoId ||
        this.fundState.currentFundId ||
        (this.route.snapshot.paramMap.get('id')) ||
        (this.route.parent ? this.route.parent.snapshot.paramMap.get('id') : null);

      // Consolidar payload final com todos os dados
      this.cedenteDataService.setFundId(idAtual);
      const payload = this.cedenteDataService.consolidarPayloadFinal('pendente');
      const cedenteId = this.cedenteDataService.getCedenteId();

      const validacaoArquivos = this.validarLimiteArquivos(payload);
      if (!validacaoArquivos.valido) {
        this.exibirAlertaSubmissao(validacaoArquivos.mensagem);
        return;
      }

      console.log('Payload final:', payload);

      // Fazer create ou update conforme o rascunho já exista
      const url = `${environment.api}/cedente/`;
      const response: any = await (cedenteId
        ? this.http.put(url + "edit", payload)
        : this.http.post(url + "save", payload)
      ).toPromise();

      console.log('Cadastro enviado com sucesso:', response);

      const idDoCedente =
        (payload && payload.fund_id) ||
        idAtual ||
        (response && response.id) ||
        (response && response.data && response.data.id) ||
        (response && response.cedente && response.cedente.id) ||
        (response && response.cedente_id) ||
        this.fundoId ||
        this.fundState.currentFundId;

      // Resetar dados após sucesso
      this.cedenteDataService.resetarDados();

      this.submitConcluido.emit();
    } catch (err) {
      console.error('Erro ao submeter cadastro:', err);
      const statusCode = err && err.status;

      if (statusCode === 413) {
        this.exibirAlertaSubmissao(`Não foi possível concluir o cadastro porque os anexos excedem o limite permitido pelo servidor.\n\nLimite máximo por arquivo: ${this.tamanhoMaximoArquivoLabel}.\n\nRevise os documentos anexados e tente novamente.`);
      } else {
        this.exibirAlertaSubmissao('Erro ao enviar cadastro. Tente novamente.');
      }
    } finally {
      this.submitting = false;
      this.dispatchLoading(false);
    }
  }

  private validarLimiteArquivos(payload: any): { valido: boolean; mensagem: string } {
    const arquivos = (payload && payload.arquivos) || [];

    if (!Array.isArray(arquivos) || !arquivos.length) {
      return { valido: true, mensagem: '' };
    }

    const arquivosInvalidos = arquivos
      .map((arquivo: any) => {
        const nome = (arquivo && (arquivo.original_name || arquivo.name)) || 'Arquivo sem nome';
        const tamanhoInformado = Number(arquivo && arquivo.tamanho);
        const tamanho = Number.isNaN(tamanhoInformado)
          ? this.estimarTamanhoArquivoBase64(arquivo && (arquivo.content_base64 || arquivo.base64))
          : tamanhoInformado;

        return {
          nome,
          tamanho
        };
      })
      .filter((item: { nome: string; tamanho: number }) => item.tamanho > this.tamanhoMaximoArquivoBytes);

    if (!arquivosInvalidos.length) {
      return { valido: true, mensagem: '' };
    }

    const listaArquivos = arquivosInvalidos
      .map((item: { nome: string; tamanho: number }) => `- ${item.nome} (${this.formatarTamanho(item.tamanho)})`)
      .join('\n');

    const mensagem = `Não foi possível concluir o cadastro.\n\nCada anexo pode ter no máximo ${this.tamanhoMaximoArquivoLabel}.\n\nArquivos acima do limite:\n${listaArquivos}`;

    return {
      valido: false,
      mensagem
    };
  }

  private estimarTamanhoArquivoBase64(base64: any): number {
    const conteudo = String(base64 || '').replace(/\s/g, '');

    if (!conteudo) {
      return 0;
    }

    const padding = conteudo.endsWith('==') ? 2 : conteudo.endsWith('=') ? 1 : 0;
    return Math.floor((conteudo.length * 3) / 4) - padding;
  }

  private formatarTamanho(bytes: number): string {
    if (!bytes || bytes <= 0) {
      return '0 KB';
    }

    const kb = bytes / 1024;

    if (kb < 1024) {
      return `${Math.round(kb * 100) / 100} KB`;
    }

    return `${Math.round((kb / 1024) * 100) / 100} MB`;
  }

  private exibirAlertaSubmissao(mensagem: string): void {
    this.mensagemAlertaSubmissao = mensagem;
    this.snackBar.open(mensagem, '', {
      duration: 2500
    });
  }

  private dispatchLoading(isLoading: boolean) {
    const root = document.querySelector('cb-cadastro-cedentes');
    if (root && (root as any).componentInstance) {
      (root as any).componentInstance.isLoading = isLoading;
    }
  }

  /**
   * Retorna a contagem total de itens adicionados
   */
  getTotalItens(): number {
    return (
      (this.dados.partes_relacionadas.length || 0) +
      (this.dados.avalistas.length || 0) +
      (this.dados.contas_desembolso.length || 0) +
      (this.dados.arquivos.length || 0)
    );
  }

  get partesRelacionadas() {
  return this.dados.partes_relacionadas || [];
}

get contratos() {
  return this.dados.contas_desembolso || [];
}

get endereco() {
  return this.dados.endereco || {};
}

get avalistas() {
  return this.dados.avalistas || [];
}

get documentosCedente() {
  return this.dados.arquivos || [];
}

get documentosAvalistas() {
  return this.dados.arquivos || [];
}

editarEtapa(etapa: number, secao?: EditarDestino['secao']) {
  this.editarEtapaSelecionada.emit({ etapa, secao });
}
}
