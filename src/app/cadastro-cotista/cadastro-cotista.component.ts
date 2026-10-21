import { Component } from '@angular/core';
import { IdentificacaoCotista } from './identificacao-inicial/identificacao-inicial.component';

@Component({
  selector: 'cb-cadastro-cotista',
  templateUrl: './cadastro-cotista.component.html',
  styleUrls: ['./cadastro-cotista.component.css']
})
export class CadastroCotistaComponent {
  mostrarIdentificacao = false;
  identificacaoCotista: IdentificacaoCotista | null = null;

  iniciarCadastro(): void {
    this.mostrarIdentificacao = true;
  }

  receberIdentificacao(identificacao: IdentificacaoCotista): void {
    this.identificacaoCotista = identificacao;
  }
}
