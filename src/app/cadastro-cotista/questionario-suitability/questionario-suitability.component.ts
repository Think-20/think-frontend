import { Component, EventEmitter, Output } from '@angular/core';

interface AlternativaSuitability {
  codigo: string;
  descricao: string;
}

interface PerguntaSuitability {
  id: number;
  enunciado: string;
  alternativas: AlternativaSuitability[];
}

@Component({
  selector: 'cb-questionario-suitability',
  templateUrl: './questionario-suitability.component.html',
  styleUrls: ['./questionario-suitability.component.css']
})
export class QuestionarioSuitabilityComponent {
  @Output() concluir = new EventEmitter<{ [perguntaId: number]: string }>();
  @Output() voltarFicha = new EventEmitter<void>();

  readonly perguntas: PerguntaSuitability[] = [
    {
      id: 1,
      enunciado: 'Qual seu objetivo ao investir considerando seu momento de vida e planos para o futuro?',
      alternativas: [
        { codigo: 'a', descricao: 'Guardar recursos para longo prazo ou me preparar para aposentadoria (acima de 8 anos)' },
        { codigo: 'b', descricao: 'Realizar objetivos a médio prazo (de 4 a 8 anos)' },
        { codigo: 'c', descricao: 'Comprar bens no curto prazo (até 4 anos)' },
        { codigo: 'd', descricao: 'Ter uma reserva de emergência para gastos inesperados' }
      ]
    },
    {
      id: 2,
      enunciado: 'O que você faria em caso de desvalorização inesperada em seus investimentos?',
      alternativas: [
        {
          codigo: 'a',
          descricao: 'Consideraria uma oportunidade para novos aportes, pois sei que meu patrimônio está sujeito a variações de curto prazo'
        },
        {
          codigo: 'b',
          descricao: 'Manteria o investimento apesar da redução, pois conheço os riscos de alguns produtos'
        },
        {
          codigo: 'c',
          descricao: 'Procuraria o banco para entender o que está acontecendo antes de tomar uma decisão'
        },
        {
          codigo: 'd',
          descricao: 'Resgataria imediatamente, pois não me sinto confortável com a possibilidade de redução do investimento'
        }
      ]
    },
    {
      id: 3,
      enunciado: 'Considerando sua renda, despesas mensais e necessidades, qual sua expectativa em relação aos investimentos?',
      alternativas: [
        { codigo: 'a', descricao: 'Pretendo investir parte do que sobra da minha renda' },
        { codigo: 'b', descricao: 'Não há sobras para investir' },
        { codigo: 'c', descricao: 'Posso precisar dos meus investimentos para cobrir despesas no curto prazo' },
        { codigo: 'd', descricao: 'Preciso do valor investido para complementar minha renda' }
      ]
    },
    {
      id: 4,
      enunciado: 'Qual valor aproximado do seu patrimônio atual (bens materiais e investimentos financeiros)?',
      alternativas: [
        { codigo: 'a', descricao: 'Acima de R$ 3 milhões' },
        { codigo: 'b', descricao: 'Entre R$ 1,5 milhão e R$ 3 milhões' },
        { codigo: 'c', descricao: 'Entre R$ 250 mil e R$ 1,5 milhão' },
        { codigo: 'd', descricao: 'Até R$ 250 mil' }
      ]
    },
    {
      id: 5,
      enunciado: 'Em quais produtos você investiu nos últimos 12 meses?',
      alternativas: [
        { codigo: 'a', descricao: 'Não investi nesse período' },
        { codigo: 'b', descricao: 'Poupança, depósitos a prazo (CDBs, LFs, LCIs ou LCAs) ou fundos de renda fixa' },
        {
          codigo: 'c',
          descricao: 'Produtos da alternativa anterior mais tesouro direto, títulos de renda fixa privados (debêntures, CRIs e CRAs), fundos multimercado ou de renda variável (fundos de ações)'
        },
        {
          codigo: 'd',
          descricao: 'Produtos da alternativa anterior mais investimentos vinculados à taxa de câmbio ou derivativos'
        }
      ]
    },
    {
      id: 6,
      enunciado: 'Com qual frequência você investiu nos últimos 12 meses, sem considerar aplicações automáticas?',
      alternativas: [
        { codigo: 'a', descricao: 'Mais de 12 vezes' },
        { codigo: 'b', descricao: 'Entre 7 e 12 vezes' },
        { codigo: 'c', descricao: 'Entre 1 e 6 vezes' },
        { codigo: 'd', descricao: 'Não investi nesse período' }
      ]
    },
    {
      id: 7,
      enunciado: 'Com relação aos produtos de investimentos:',
      alternativas: [
        { codigo: 'a', descricao: 'Tenho conhecimento e experiência prática' },
        { codigo: 'b', descricao: 'Tenho conhecimento, mas não tenho experiência prática' },
        { codigo: 'c', descricao: 'Tenho pouco conhecimento, porém tenho experiência prática' },
        { codigo: 'd', descricao: 'Não possuo conhecimento nem experiência prática' }
      ]
    }
  ];

  respostas: { [perguntaId: number]: string } = {};

  get todasRespondidas(): boolean {
    return this.perguntas.every(pergunta => !!this.respostas[pergunta.id]);
  }

  selecionarResposta(perguntaId: number, evento: Event): void {
    this.respostas[perguntaId] = (evento.target as HTMLInputElement).value;
  }

  enviarRespostas(): void {
    this.concluir.emit({ ...this.respostas });
  }

  retornarParaFicha(): void {
    this.voltarFicha.emit();
  }
}
