import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';
import { IdentificacaoCotista } from './identificacao-inicial/identificacao-inicial.component';
import { CotistaKanban } from './kanban-cotista/kanban-cotista.component';

@Component({
  selector: 'cb-cadastro-cotista',
  templateUrl: './cadastro-cotista.component.html',
  styleUrls: ['./cadastro-cotista.component.css']
})
export class CadastroCotistaComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  mostrarIdentificacao = false;
  mostrarFichaCadastral = false;
  mostrarQuestionarioSuitability = false;
  salvandoPerfil = false;
  identificacaoCotista: IdentificacaoCotista | null = null;
  cadastroPayload: { [key: string]: any } | null = null;
  cotistaEmEdicao: CotistaKanban | null = null;

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    const navigationState = navigation && navigation.extras && navigation.extras.state;
    const navigationCotista = navigationState && navigationState['cotista'];
    const historyState = window.history && window.history.state;
    const cotista = navigationCotista || (historyState && historyState['cotista']);

    if (cotista) {
      this.carregarCotistaParaEdicao(cotista);
      return;
    }

    if (this.route.snapshot.data['novoCadastro']) {
      this.iniciarCadastro();
    }
  }

  iniciarCadastro(): void {
    this.mostrarIdentificacao = true;
  }

  receberIdentificacao(identificacao: IdentificacaoCotista): void {
    this.identificacaoCotista = identificacao;
    this.mostrarFichaCadastral = true;
  }

  continuarParaSuitability(fichaPayload?: { [key: string]: any }): void {
    this.cadastroPayload = fichaPayload ? this.combinarPayload(fichaPayload) : null;
    this.mostrarQuestionarioSuitability = true;
  }

  salvarRascunho(fichaPayload: { [key: string]: any }): void {
    this.cadastroPayload = this.combinarPayload(fichaPayload);
    this.cadastroPayload['status'] = 'rascunho';
    this.cadastroPayload['enviar'] = false;
    this.salvarCotista();
  }

  receberSuitability(respostas: { [perguntaId: number]: string }): void {
    if (this.salvandoPerfil) {
      return;
    }

    if (!this.cadastroPayload) {
      console.error('Não há dados cadastrais para salvar o cotista.');
      this.snackBar.open('Não foi possível salvar seu cadastro. Tente novamente.', '', {
        duration: 3000
      });
      return;
    }

    const respostasConvertidas = Object.keys(respostas || {}).map(pergunta => ({
      pergunta: Number(pergunta),
      opcao: 'abcd'.indexOf(respostas[Number(pergunta)].toLowerCase()) + 1 || null
    }));
    respostasConvertidas.sort((a: any, b: any) => a.pergunta - b.pergunta);

    this.cadastroPayload['suitability'] = {
      perfil: null,
      respostas: respostasConvertidas
    };
    this.cadastroPayload['status'] = 'pendente';
    this.cadastroPayload['enviar'] = true;
    this.salvarCotista();
  }

  private carregarCotistaParaEdicao(cotista: CotistaKanban): void {
    this.cotistaEmEdicao = cotista;
    this.cadastroPayload = { ...cotista };
    this.identificacaoCotista = {
      tipoInvestidor: String(cotista.tipo_pessoa || '').toLowerCase() === 'juridica'
        ? 'PESSOA_JURIDICA'
        : 'PESSOA_FISICA',
      documento: String(cotista.documento || '').replace(/\D/g, '')
    };
    this.mostrarIdentificacao = false;
    this.mostrarFichaCadastral = true;
  }

  private combinarPayload(dados: { [key: string]: any }): { [key: string]: any } {
    const existente = this.cadastroPayload || {};
    const payload = { ...existente, ...dados };
    if (existente.id != null) {
      payload['id'] = existente.id;
    }

    [
      'ppe_relacionada_cargo',
      'ppe_relacionada_nome',
      'ppe_relacionada_cpf',
      'ppe_relacionada_nacionalidade'
    ].forEach(campo => {
      if (dados[campo] == null && existente[campo] != null) {
        payload[campo] = existente[campo];
      }
    });

    if (existente.operador || dados.operador) {
      payload['operador'] = {
        ...(existente.operador || {}),
        ...(dados.operador || {}),
        endereco: {
          ...((existente.operador && existente.operador.endereco) || {}),
          ...((dados.operador && dados.operador.endereco) || {})
        }
      };
      [
        'nome_completo',
        'data_nascimento',
        'ppe_relacionada_cargo',
        'ppe_relacionada_nome',
        'ppe_relacionada_cpf',
        'ppe_relacionada_nacionalidade'
      ].forEach(campo => {
        if (dados.operador && dados.operador[campo] == null &&
            existente.operador && existente.operador[campo] != null) {
          payload['operador'][campo] = existente.operador[campo];
        }
      });
    }

    const arquivosExistentes = Array.isArray(existente.arquivos) && existente.arquivos.length
      ? existente.arquivos
      : Array.isArray(existente.cotista_files) ? existente.cotista_files : [];
    delete payload['cotista_files'];
    const arquivosNovos = Array.isArray(dados.arquivos) ? dados.arquivos : [];
    if (arquivosNovos.length) {
      const tiposSubstituidos = arquivosNovos.map(arquivo => String(arquivo.document_type));
      payload['arquivos'] = [
        ...arquivosExistentes.filter(arquivo =>
          tiposSubstituidos.indexOf(String(arquivo.document_type)) === -1
        ),
        ...arquivosNovos
      ];
    } else if (arquivosExistentes.length || Object.prototype.hasOwnProperty.call(dados, 'arquivos')) {
      payload['arquivos'] = arquivosExistentes;
    }

    return payload;
  }

  private salvarCotista(): void {
    if (!this.cadastroPayload || this.salvandoPerfil) {
      return;
    }

    const payload = this.cadastroPayload;
    const salvandoRascunho = payload.status === 'rascunho';
    const url = payload.id != null
      ? `${environment.api}/cotista/edit`
      : `${environment.api}/cotista/save`;
    const request = payload.id != null
      ? this.http.put<{ data?: CotistaKanban }>(url, payload)
      : this.http.post<{ data?: CotistaKanban }>(url, payload);

    this.salvandoPerfil = true;
    request.subscribe({
      next: (resposta) => {
        this.salvandoPerfil = false;
        if (!resposta || !resposta.data) {
          console.error('A resposta do cadastro não contém os dados do cotista:', resposta);
          this.snackBar.open('Não foi possível carregar os dados do cadastro salvo.', '', {
            duration: 3000
          });
          return;
        }

        const cotistaSalvo = {
          ...payload,
          ...resposta.data,
          status: payload.status
        };
        const arquivosResposta = Array.isArray(resposta.data.arquivos) && resposta.data.arquivos.length
          ? resposta.data.arquivos
          : resposta.data.cotista_files;
        if (Array.isArray(arquivosResposta) && arquivosResposta.length) {
          cotistaSalvo['arquivos'] = arquivosResposta;
        }
        if ((!Array.isArray(arquivosResposta) || !arquivosResposta.length) &&
            Array.isArray(payload.arquivos) && payload.arquivos.length) {
          cotistaSalvo['arquivos'] = payload.arquivos;
        }

        this.abrirKanbanCotista(cotistaSalvo);
      },
      error: (erro) => {
        console.error('Erro ao salvar cadastro de cotista:', erro);
        this.salvandoPerfil = false;
        this.snackBar.open(
          salvandoRascunho
            ? 'Não foi possível salvar o rascunho. Tente novamente.'
            : 'Não foi possível salvar seu cadastro. Tente novamente.',
          '',
          { duration: 3000 }
        );
      }
    });
  }

  private abrirKanbanCotista(cotista: CotistaKanban): void {
    this.router.navigateByUrl('/kanban-cotista', {
      state: { cotistas: [cotista] }
    });
  }

  voltarParaFichaCadastral(): void {
    this.mostrarQuestionarioSuitability = false;
  }
}
