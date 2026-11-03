import { Component } from '@angular/core';
import { IdentificacaoCotista } from './identificacao-inicial/identificacao-inicial.component';

@Component({
  selector: 'cb-cadastro-cotista',
  templateUrl: './cadastro-cotista.component.html',
  styleUrls: ['./cadastro-cotista.component.css']
})
export class CadastroCotistaComponent {
  mostrarIdentificacao = false;
  mostrarFichaCadastral = false;
  mostrarQuestionarioSuitability = false;
  identificacaoCotista: IdentificacaoCotista | null = null;
  cadastroPayload: { [key: string]: any } | null = null;

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
    }
  }

  voltarParaFichaCadastral(): void {
    this.mostrarQuestionarioSuitability = false;
  }
}
