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

  ngOnInit(): void {
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
    this.cadastroPayload = fichaPayload || null;
    this.mostrarQuestionarioSuitability = true;
  }

  receberSuitability(respostas: { [perguntaId: number]: string }): void {
    if (this.salvandoPerfil) {
      return;
    }

    if (this.cadastroPayload) {
      const valores = Object.keys(respostas || {}).map(pergunta => respostas[Number(pergunta)]);
      const respostasConvertidas = Object.keys(respostas || {}).map(pergunta => ({
        pergunta: Number(pergunta),
        opcao: 'abcd'.indexOf(respostas[Number(pergunta)].toLowerCase()) + 1 || null
      }));

      this.cadastroPayload['suitability'] = {
        perfil: valores.length === 7 ? null : null,
        respostas: respostasConvertidas
      };
      this.cadastroPayload['suitability']['respostas'].sort((a: any, b: any) => a.pergunta - b.pergunta);
      console.log('Objeto cadastral enviado ao backend:', this.cadastroPayload);

      this.salvandoPerfil = true;
      this.http.post<{ data?: CotistaKanban }>(
        `${environment.api}/cotista/save`,
        this.cadastroPayload
      ).subscribe({
        next: (resposta) => {
          this.salvandoPerfil = false;
          if (!resposta || !resposta.data) {
            console.error('A resposta do cadastro não contém os dados do cotista:', resposta);
            this.snackBar.open('Não foi possível carregar os dados do cadastro salvo.', '', {
              duration: 3000
            });
            return;
          }

          this.abrirKanbanCotista(resposta.data);
        },
        error: (erro) => {
          console.error('Erro ao salvar cadastro de cotista:', erro);
          this.salvandoPerfil = false;
          this.snackBar.open('Não foi possível salvar seu cadastro. Tente novamente.', '', {
            duration: 3000
          });
        }
      });
      return;
    }

    this.abrirKanbanCotista(this.cadastroPayload || {});
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
