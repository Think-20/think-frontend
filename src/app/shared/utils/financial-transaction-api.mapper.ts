import { BankAccount } from "app/bank-accounts/bank-account.model";
import { Bank } from "app/banks/bank.model";
import { EBank, banks } from "app/shared/enums/bank.enum";
import { FinancialTransaction } from "app/shared/models/financial-transaction.model";

export const FINANCIAL_SELECTED_BANK_ACCOUNT_ID_STORAGE_KEY = "think.financialHome.selectedBankAccountId";

export function normalizeTransactionsList(rawList: any[]): FinancialTransaction[] {
  if (!rawList || !rawList.length) {
    return [];
  }
  const out: FinancialTransaction[] = [];
  let i = 0;
  for (i = 0; i < rawList.length; i++) {
    out.push(normalizeTransactionFromApi(rawList[i]));
  }
  return out;
}

export function normalizeTransactionFromApi(raw: any): FinancialTransaction {
  const cat = raw && raw.categoria ? raw.categoria : {};
  const idcategoria =
    typeof cat.idcategoria === "number" ? cat.idcategoria : typeof raw.idcategoria === "number" ? raw.idcategoria : 0;
  const nomeCat = cat.nome ? String(cat.nome) : "";
  const temaCat = typeof cat.tema === "number" ? cat.tema : 0;
  const conta = normalizeContaFromApi(raw.contabancaria);
  const idcb = typeof raw.idcontabancaria === "number" ? raw.idcontabancaria : conta.id;
  const t: FinancialTransaction = {
    idtransacao: typeof raw.idtransacao === "number" ? raw.idtransacao : 0,
    idjob: typeof raw.idjob === "number" ? raw.idjob : 0,
    tipotransacao: typeof raw.tipotransacao === "number" ? raw.tipotransacao : 0,
    descricao: raw.descricao ? String(raw.descricao) : "",
    observacao: raw.observacao !== undefined && raw.observacao !== null ? String(raw.observacao) : "",
    status: typeof raw.status === "number" ? raw.status : 0,
    datacriacao: raw.datacriacao ? String(raw.datacriacao) : "",
    datarecebimento: raw.datarecebimento ? String(raw.datarecebimento) : "",
    datavencimento: raw.datavencimento ? String(raw.datavencimento) : "",
    datarealizado: raw.datarealizado ? String(raw.datarealizado) : "",
    datacobranca: raw.datacobranca ? String(raw.datacobranca) : "",
    idcategoria: idcategoria,
    categoria: { idcategoria: idcategoria, nome: nomeCat, tema: temaCat },
    idcontabancaria: idcb,
    contabancaria: conta,
    formapagamento: typeof raw.formapagamento === "number" ? raw.formapagamento : 0,
    numparcelas: typeof raw.numparcelas === "number" ? raw.numparcelas : 0,
    valortotal: typeof raw.valortotal === "number" ? raw.valortotal : 0,
    periodo: typeof raw.periodo === "number" ? raw.periodo : 0,
    chavepix: raw.chavepix ? String(raw.chavepix) : "",
    banco: raw.banco ? String(raw.banco) : "",
    agencia: raw.agencia ? String(raw.agencia) : "",
    contacorrente: raw.contacorrente ? String(raw.contacorrente) : "",
    parcelas: raw.parcelas && raw.parcelas.length ? raw.parcelas : [],
    tags: raw.tags && raw.tags.length ? raw.tags : []
  };
  if (raw.arquivoboleto) {
    t.arquivoboleto = raw.arquivoboleto;
  }
  if (raw.arquivos && raw.arquivos.length) {
    t.arquivos = raw.arquivos;
  }
  return t;
}

export function normalizeContaFromApi(api: any): BankAccount {
  const account = new BankAccount();
  if (!api) {
    account.id = 0;
    account.name = "";
    account.agency = "";
    account.account_number = "";
    account.bank = new Bank();
    account.bank.id = 0;
    account.bank.name = "";
    account.bank.code = EBank.default;
    return account;
  }
  account.id = typeof api.idcontabancaria === "number" ? api.idcontabancaria : typeof api.id === "number" ? api.id : 0;
  account.name = api.nome ? String(api.nome) : api.name ? String(api.name) : "";
  account.agency = api.agencia ? String(api.agencia) : "";
  account.account_number = api.conta ? String(api.conta) : api.account_number ? String(api.account_number) : "";
  account.bank = new Bank();
  const codeEnum = resolveBankCodeFromString(api.banco ? String(api.banco) : "");
  account.bank.code = codeEnum;
  const meta = banks.get(codeEnum);
  account.bank.name = meta && meta.name ? meta.name : "";
  account.bank.id = account.id;
  return account;
}

export function resolveBankCodeFromString(codeStr: string): EBank {
  const s = codeStr ? String(codeStr).trim() : "";
  if (!s) {
    return EBank.default;
  }
  let found = EBank.default;
  banks.forEach(function (meta, key) {
    if (meta.code === s) {
      found = key;
    }
  });
  return found;
}

export function readStoredFinancialBankAccountId(): number | null {
  try {
    const raw = localStorage.getItem(FINANCIAL_SELECTED_BANK_ACCOUNT_ID_STORAGE_KEY);
    if (raw === null || raw === "") {
      return null;
    }
    const parsed = parseInt(raw, 10);
    if (isNaN(parsed) || parsed < 1) {
      return null;
    }
    return parsed;
  } catch (e) {
    return null;
  }
}
