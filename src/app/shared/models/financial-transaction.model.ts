/**
 * Transação financeira (formato alinhado ao backend).
 */
export interface FinancialTransactionTag {
  idtag: number;
  descricao: string;
}

export interface FinancialTransactionParcela {
  idparcela: number;
  idtransacao: number;
  valor: number;
  data: string;
  ordem: number;
}

export interface FinancialTransactionCategory {
  idcategoria: number;
  nome: string;
  tema: number;
}

export interface FinancialTransactionBankAccount {
  idcontabancaria: number;
  nome: string;
  banco: string;
  agencia: string;
  conta: string;
  datacadastro: string;
}

/** Metadados de um arquivo anexado (boleto ou anexos). */
export interface FinancialTransactionArquivo {
  idarquivo: number;
  nomearquivo: string;
  diretorio: string;
  dataupload: string;
}

export interface FinancialTransaction {
  idtransacao: number;
  idjob: number;
  tipotransacao: number;
  descricao: string;
  observacao: string;
  status: number;
  datacriacao: string;
  datarecebimento: string;
  datavencimento: string;
  datarealizado: string;
  datacobranca: string;
  idcategoria: number;
  categoria: FinancialTransactionCategory;
  idcontabancaria: number;
  contabancaria: FinancialTransactionBankAccount;
  idcontabancariacartaocredito?: number;
  contabancariacartaocredito?: FinancialTransactionBankAccount;
  formapagamento: number;
  numparcelas: number;
  valortotal: number;
  periodo: number;
  chavepix: string;
  banco: string;
  agencia: string;
  contacorrente: string;
  arquivoboleto?: FinancialTransactionArquivo;
  arquivos?: FinancialTransactionArquivo[];
  parcelas: FinancialTransactionParcela[];
  tags: FinancialTransactionTag[];
}
