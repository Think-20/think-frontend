import { Injectable } from "@angular/core";
import autoTable from "jspdf-autotable";
import { jsPDF } from "jspdf";
import { EFinancialStep } from "app/shared/enums/financial-step.enum";
import { ETransactionPaymentMethod, transactionPaymentMethods } from "app/shared/enums/transaction-payment-method.enum";
import { ETransactionStatus, transactionStatuses } from "app/shared/enums/transaction-status.enum";
import { FinancialTransaction } from "app/shared/models/financial-transaction.model";

export interface FinancialTransactionsPdfExportOptions {
  /** Linhas do relatório (mesmo contrato da API / `FinancialTransaction`). */
  transactions: FinancialTransaction[];
  /** Id exibido do job (ex.: `0123/2026` via `jobService.showId(job)`). */
  jobDisplayId?: string;
  /** Id do job para incluir no título (ex.: `Job #4281`). */
  jobId?: number;
  /** Receitas ou despesas: define colunas de datas e nome do arquivo. */
  transactionType: EFinancialStep;
  /** Título no PDF (padrão: “Controle de Receitas” / “Controle de Despesas”). */
  reportTitle?: string;
  /** Prefixo do arquivo salvo (padrão: `controle-receitas_` / `controle-despesas_`). */
  fileNamePrefix?: string;
}

@Injectable({ providedIn: "root" })
export class FinancialTransactionsPdfExportService {
  /**
   * Gera e baixa um PDF em paisagem com tabela das transações.
   * Aguarda um array de `FinancialTransaction` (pode ser vazio).
   */
  export(options: FinancialTransactionsPdfExportOptions): void {
    const transactions = options.transactions ? options.transactions.slice() : [];
    const transactionType = options.transactionType;
    const reportTitleBase = options.reportTitle ? options.reportTitle : this.defaultReportTitle(transactionType);
    const resolvedJobId =
      options.jobId !== undefined && options.jobId !== null ? options.jobId : this.extractJobIdFromTransactions(transactions);
    const resolvedJobDisplayId = this.resolveJobDisplayId(options.jobDisplayId, resolvedJobId);
    const reportTitle = this.buildReportTitle(reportTitleBase, resolvedJobDisplayId);
    const fileNamePrefix = options.fileNamePrefix ? options.fileNamePrefix : this.defaultFileNamePrefix(transactionType);

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });
    const marginX = 14;
    let y = 16;

    doc.setFontSize(16);
    doc.text(reportTitle, marginX, y);
    y += 10;

    const total = this.sumValortotal(transactions);
    const count = transactions.length;

    doc.setFontSize(10);
    doc.text("Valor total: " + this.formatBrl(total), marginX, y);
    y += 6;
    doc.text("Total de lançamentos: " + String(count), marginX, y);
    y += 8;

    const isExpense = transactionType === EFinancialStep.expenses;
    const self = this;
    const body = transactions.map(function (t) {
      const categoryName = t.categoria && t.categoria.nome ? t.categoria.nome : "";
      const contaNome = t.contabancaria && t.contabancaria.name ? t.contabancaria.name : "";
      const colA = isExpense ? self.formatDateIso(t.datavencimento) : self.formatDateIso(t.datarecebimento);
      const colB = isExpense ? self.formatDateIso(t.datarealizado) : self.formatDateIso(t.datacobranca);
      return [
        colA,
        colB,
        t.descricao,
        categoryName,
        self.paymentMethodLabel(t.formapagamento),
        contaNome,
        self.statusLabel(t.status),
        self.formatBrl(t.valortotal)
      ];
    });

    const headRow = isExpense
      ? [["Data vencimento", "Data realizado", "Descrição", "Categoria", "Forma de pagamento", "Conta", "Status", "Valor"]]
      : [["Data recebimento", "Data cobrança", "Descrição", "Categoria", "Forma de pagamento", "Conta", "Status", "Valor"]];

    autoTable(doc, {
      startY: y,
      head: headRow,
      body: body,
      styles: { fontSize: 8, cellPadding: 1.5 },
      headStyles: { fillColor: [66, 66, 66], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: marginX, right: marginX }
    });

    const exportedAt = this.formatExportedAt(new Date());
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(8);
    doc.setTextColor(110);
    doc.text("Exportado em: " + exportedAt, marginX, pageHeight - 6);
    doc.setTextColor(0);

    doc.save(this.buildPdfFileName(fileNamePrefix, resolvedJobDisplayId));
  }

  private defaultReportTitle(transactionType: EFinancialStep): string {
    return transactionType === EFinancialStep.expenses ? "Controle de Despesas" : "Controle de Receitas";
  }

  private defaultFileNamePrefix(transactionType: EFinancialStep): string {
    return transactionType === EFinancialStep.expenses ? "controle-despesas_" : "controle-receitas_";
  }

  private resolveJobDisplayId(jobDisplayId: string | undefined, jobId: number | null): string {
    if (jobDisplayId && jobDisplayId.trim().length) {
      return jobDisplayId.trim();
    }
    if (jobId !== null) {
      return String(jobId);
    }
    return "";
  }

  private buildReportTitle(baseTitle: string, jobDisplayId: string): string {
    if (!jobDisplayId) {
      return baseTitle;
    }
    return baseTitle + " - Job " + jobDisplayId;
  }

  private extractJobIdFromTransactions(transactions: FinancialTransaction[]): number | null {
    let i = 0;
    for (i = 0; i < transactions.length; i++) {
      const t = transactions[i];
      if (t && t.idjob !== undefined && t.idjob !== null) {
        return t.idjob;
      }
    }
    return null;
  }

  private buildPdfFileName(prefix: string, jobDisplayId: string): string {
    const d = new Date();
    const pad = function (n: number): string {
      return n < 10 ? "0" + String(n) : String(n);
    };
    const stamp =
      String(d.getFullYear()) + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + "_" + pad(d.getHours()) + pad(d.getMinutes());
    const jobPart = jobDisplayId ? "_job-" + this.normalizeForFileName(jobDisplayId) : "";
    return prefix + stamp + jobPart + ".pdf";
  }

  private normalizeForFileName(value: string): string {
    return value.replace(/[^a-zA-Z0-9_-]+/g, "-");
  }

  private formatExportedAt(date: Date): string {
    const pad = function (n: number): string {
      return n < 10 ? "0" + String(n) : String(n);
    };
    return (
      pad(date.getDate()) +
      "/" +
      pad(date.getMonth() + 1) +
      "/" +
      String(date.getFullYear()) +
      " " +
      pad(date.getHours()) +
      ":" +
      pad(date.getMinutes())
    );
  }

  private sumValortotal(transactions: FinancialTransaction[]): number {
    return transactions.reduce(function (sum, t) {
      return sum + (typeof t.valortotal === "number" ? t.valortotal : 0);
    }, 0);
  }

  private statusLabel(status: number): string {
    const label = transactionStatuses.get(status as ETransactionStatus);
    return label ? label : "";
  }

  private paymentMethodLabel(method: number): string {
    const label = transactionPaymentMethods.get(method as ETransactionPaymentMethod);
    return label ? label : "";
  }

  private formatBrl(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  }

  private formatDateIso(iso: string): string {
    if (!iso) {
      return "";
    }
    const datePart = iso.indexOf("T") >= 0 ? iso.split("T")[0] : iso;
    const parts = datePart.split("-");
    if (parts.length !== 3) {
      return iso;
    }
    return parts[2] + "/" + parts[1] + "/" + parts[0];
  }
}
