import { Injectable } from "@angular/core";
import autoTable from "jspdf-autotable";
import { jsPDF } from "jspdf";
import { GamificationGoalView } from "app/gamification/user-goal-progress.model";

export interface GamificationPdfExportOptions {
  /** Id do usuário cujas metas estão no relatório (colaborador avaliado — nome do arquivo). */
  userId: number | null;
  userName: string;
  userDepartment: string;
  /** Datas do filtro aplicado (yyyy-MM-dd). */
  dateInit: string;
  dateEnd: string;
  goals: GamificationGoalView[];
  goalsMetCount: number;
  goalsTotalCount: number;
}

@Injectable({ providedIn: "root" })
export class GamificationPdfExportService {
  export(options: GamificationPdfExportOptions): void {
    const goals = options.goals ? options.goals.slice() : [];
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });
    const marginX = 14;
    let y = 16;

    doc.setFontSize(16);
    doc.text("Metas e desempenho", marginX, y);
    y += 9;

    doc.setFontSize(10);
    doc.text("Colaborador: " + this.safeText(options.userName), marginX, y);
    y += 6;
    doc.text("Departamento: " + this.safeText(options.userDepartment), marginX, y);
    y += 6;
    doc.text(
      "Período da consulta: " + this.formatYmdToBr(options.dateInit) + " a " + this.formatYmdToBr(options.dateEnd),
      marginX,
      y
    );
    y += 8;

    const total = options.goalsTotalCount;
    const met = options.goalsMetCount;
    const ratio = total > 0 ? Math.round((met / total) * 100) : 0;
    doc.setFontSize(10);
    doc.text("Metas no período: " + String(total), marginX, y);
    y += 6;
    doc.text("Metas cumpridas: " + String(met), marginX, y);
    y += 6;
    doc.text("Taxa de cumprimento: " + String(ratio) + "%", marginX, y);
    y += 8;

    const self = this;
    const body = goals.map(function (g) {
      return [String(g.order), g.title, self.formatResult(g), self.formatPercentCell(g), g.statusLabel];
    });

    autoTable(doc, {
      startY: y,
      head: [["Nº", "Meta", "Resultado", "%", "Status"]],
      body: body,
      styles: { fontSize: 8, cellPadding: 1.5 },
      headStyles: { fillColor: [66, 66, 66], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: marginX, right: marginX }
    });

    const exportedAt = this.formatExportedAt(new Date());
    const autoTbl = (doc as any).lastAutoTable;
    const pageH = doc.internal.pageSize.getHeight();
    let footerY = autoTbl && typeof autoTbl.finalY === "number" ? autoTbl.finalY + 8 : y + 8;
    if (footerY > pageH - 12) {
      doc.addPage();
      footerY = 16;
    }
    doc.setFontSize(8);
    doc.setTextColor(110);
    doc.text("Data da exportação: " + exportedAt, marginX, footerY);
    doc.setTextColor(0);

    doc.save(this.buildPdfFileName(options.userId));
  }

  private safeText(s: string): string {
    if (!s || !String(s).trim()) {
      return "—";
    }
    return String(s).trim();
  }

  private formatYmdToBr(ymd: string): string {
    if (!ymd || ymd.length < 10) {
      return ymd ? ymd : "";
    }
    const p = ymd.substring(0, 10).split("-");
    if (p.length !== 3) {
      return ymd;
    }
    return p[2] + "/" + p[1] + "/" + p[0];
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

  private buildPdfFileName(userId: number | null): string {
    const d = new Date();
    const pad = function (n: number): string {
      return n < 10 ? "0" + String(n) : String(n);
    };
    const stamp =
      String(d.getFullYear()) + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) + "_" + pad(d.getHours()) + pad(d.getMinutes());
    const uid =
      userId !== undefined && userId !== null && !isNaN(Number(userId)) && Number(userId) > 0 ? String(Math.floor(Number(userId))) : "0";
    return "metas-desempenho_user-" + uid + "_" + stamp + ".pdf";
  }

  private formatBrl(value: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  private formatNumPt(value: number, minFrac: number, maxFrac: number): string {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: minFrac,
      maximumFractionDigits: maxFrac
    }).format(value);
  }

  private formatResult(goal: GamificationGoalView): string {
    if (goal.kind === "unevaluated") {
      return goal.detailLine ? String(goal.detailLine) : "—";
    }
    if (goal.kind === "currency") {
      const cur = typeof goal.current === "number" && !isNaN(goal.current) ? goal.current : 0;
      const tgt = typeof goal.target === "number" && !isNaN(goal.target) ? goal.target : 0;
      const curS = this.formatBrl(cur);
      if (goal.missingTarget || tgt <= 0) {
        return curS + " / —";
      }
      return curS + " / " + this.formatBrl(tgt);
    }
    if (goal.kind === "percent") {
      if (goal.useLabelsFromApi && goal.currentDisplay && goal.targetDisplay) {
        return String(goal.currentDisplay) + " / " + String(goal.targetDisplay);
      }
      const cur = typeof goal.current === "number" && !isNaN(goal.current) ? goal.current : 0;
      const tgt = typeof goal.target === "number" && !isNaN(goal.target) ? goal.target : 0;
      return this.formatNumPt(cur, 1, 1) + "% / " + this.formatNumPt(tgt, 1, 1) + "%";
    }
    const cur = typeof goal.current === "number" && !isNaN(goal.current) ? goal.current : 0;
    const tgt = typeof goal.target === "number" && !isNaN(goal.target) ? goal.target : 0;
    return this.formatNumPt(cur, 0, 0) + " / " + this.formatNumPt(tgt, 0, 0);
  }

  private formatPercentCell(goal: GamificationGoalView): string {
    if (goal.kind === "unevaluated") {
      return "—";
    }
    return this.formatNumPt(goal.percent, 0, 0);
  }
}
