import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from "@angular/core";
import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { Subscription } from "rxjs";
import {
  FinancialTransaction,
  FinancialTransactionArquivo,
  FinancialTransactionCategory,
  FinancialTransactionParcela,
  FinancialTransactionTag
} from "app/shared/models/financial-transaction.model";
import { CategoryModalComponent } from "../category-modal/category-modal.component";
import { MatDialog } from "@angular/material/dialog";
import { ETransactionPaymentMethod } from "app/shared/enums/transaction-payment-method.enum";
import { EFinancialStep } from "app/shared/enums/financial-step.enum";
import { BankAccountModalComponent, BankAccountModalResult } from "../bank-account-modal/bank-account-modal.component";
import { MatSnackBar } from "@angular/material";
import { BankAccount } from "app/bank-accounts/bank-account.model";
import { FinancialService } from "app/financial/financial.service";

@Component({
  selector: "cb-financial-form",
  templateUrl: "./financial-form.component.html",
  styleUrls: ["./financial-form.component.scss"]
})
export class FinancialFormComponent implements OnInit, OnChanges, OnDestroy {
  private readonly PERIODO_VALOR_UNICO = 1;
  private readonly PERIODO_PARCELADO = 2;

  @Input() transaction: FinancialTransaction;
  @Input() transactionType: EFinancialStep = EFinancialStep.revenues;
  @Input() categories: FinancialTransactionCategory[] = [];
  @Input() accounts: BankAccount[] = [];
  @Input() formasPagamento: Array<{ id: number; nome: string }> = [];
  @Input() periodos: Array<{ id: number; nome: string }> = [];

  @Output() saved = new EventEmitter<FinancialTransaction>();

  form: FormGroup;

  submitted = false;

  /** Evita envio duplicado enquanto POST/PUT está em andamento. */
  loadingSubmit = false;

  /** Cópia editável das tags (commit envia isto no payload). */
  tagsDraft: FinancialTransactionTag[] = [];

  /** Cópia editável dos anexos (`arquivos`); independente do boleto. */
  arquivosDraft: FinancialTransactionArquivo[] = [];

  /** Incrementado ao aplicar dados da transação; fecha o campo de nova tag no filho. */
  tagSectionKey = 0;

  boletoDropzoneActive = false;

  private boletoDragEnterCount = 0;

  anexosDropzoneActive = false;

  private anexosDragEnterCount = 0;

  private numParcelasSub: Subscription | undefined;

  private periodoSub: Subscription | undefined;

  private formaPagamentoSub: Subscription | undefined;

  constructor(private dialog: MatDialog, private snackBar: MatSnackBar, private financialService: FinancialService) {}

  get isExpenseForm(): boolean {
    return this.transactionType === EFinancialStep.expenses;
  }

  get isRevenueForm(): boolean {
    return this.transactionType === EFinancialStep.revenues;
  }

  ngOnInit(): void {
    this.buildForm();
    this.bindParcelamentoListeners();
    this.patchFormFromTransaction();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.form) {
      return;
    }
    if (changes.formasPagamento && this.formasPagamento && this.formasPagamento.length) {
      const formaCtrl = this.form.get("formapagamento");
      const currentForma = formaCtrl ? formaCtrl.value : null;
      if (!currentForma || currentForma.id === undefined || currentForma.id === null) {
        const defaultForma = this.findOptionById(this.formasPagamento, ETransactionPaymentMethod.pix);
        if (defaultForma && formaCtrl) {
          formaCtrl.setValue(defaultForma, { emitEvent: false });
          this.updatePaymentMethodValidators();
        }
      }
    }
    if (changes.periodos && this.periodos && this.periodos.length) {
      const periodoCtrl = this.form.get("periodo");
      const currentPeriodo = periodoCtrl ? periodoCtrl.value : null;
      if (!currentPeriodo || currentPeriodo.id === undefined || currentPeriodo.id === null) {
        const defaultPeriodo = this.findOptionById(this.periodos, this.PERIODO_VALOR_UNICO);
        if (defaultPeriodo && periodoCtrl) {
          periodoCtrl.setValue(defaultPeriodo, { emitEvent: false });
          this.updatePeriodoValidators();
        }
      }
    }
    if (changes.transaction && !changes.transaction.firstChange) {
      this.patchFormFromTransaction();
    }
    if (changes.transactionType && !changes.transactionType.firstChange) {
      this.updateTransactionTypeValidators();
      this.patchFormFromTransaction();
    }
  }

  ngOnDestroy(): void {
    if (this.numParcelasSub) {
      this.numParcelasSub.unsubscribe();
    }
    if (this.periodoSub) {
      this.periodoSub.unsubscribe();
    }
    if (this.formaPagamentoSub) {
      this.formaPagamentoSub.unsubscribe();
    }
  }

  commit(): void {
    this.submitted = true;

    if (!this.form || !this.transaction) {
      return;
    }

    if (this.loadingSubmit) {
      return;
    }

    this.form.updateValueAndValidity({ emitEvent: false });

    if (this.form.invalid) {
      this.snackBar.open("Por favor, preencha todos os campos obrigatórios.", "", {
        duration: 3000
      });

      this.form.markAllAsTouched();

      return;
    }

    const value = this.form.value;
    const base = this.transaction;
    const categoria: FinancialTransactionCategory = value.categoria ? value.categoria : base.categoria;

    const formaCtrl = value.formapagamento;
    const periodoCtrl = value.periodo;

    const formapagamentoId = formaCtrl && formaCtrl.id !== undefined && formaCtrl.id !== null ? formaCtrl.id : base.formapagamento;
    const periodoId = periodoCtrl && periodoCtrl.id !== undefined && periodoCtrl.id !== null ? periodoCtrl.id : base.periodo;

    let contabancaria: BankAccount = base.contabancaria;
    let idcontabancaria = base.idcontabancaria;
    const selContaPrincipal = value.contabancaria;
    if (selContaPrincipal) {
      contabancaria = selContaPrincipal;
      if (selContaPrincipal.idcontabancaria !== undefined && selContaPrincipal.idcontabancaria !== null) {
        idcontabancaria = selContaPrincipal.idcontabancaria;
      }
    }

    let idcontabancariacartaocredito = base.idcontabancariacartaocredito;
    let contabancariacartaocredito = base.contabancariacartaocredito;
    if (formapagamentoId === ETransactionPaymentMethod.creditCard) {
      const selContaCartao = value.contabancariacartaocredito;
      if (selContaCartao) {
        contabancariacartaocredito = selContaCartao;
        if (selContaCartao.idcontabancaria !== undefined && selContaCartao.idcontabancaria !== null) {
          idcontabancariacartaocredito = selContaCartao.idcontabancaria;
        }
      } else {
        contabancariacartaocredito = undefined;
        idcontabancariacartaocredito = undefined;
      }
    }

    let bancoVal = "";
    let agenciaVal = "";
    let contacorrenteVal = "";
    if (formapagamentoId === ETransactionPaymentMethod.deposit) {
      bancoVal = value.banco ? value.banco : "";
      agenciaVal = value.agencia ? value.agencia : "";
      contacorrenteVal = value.contacorrente ? value.contacorrente : "";
    }

    let chavepixVal = "";
    if (formapagamentoId === ETransactionPaymentMethod.pix) {
      chavepixVal = value.chavepix ? value.chavepix : "";
    }

    let arquivoboletoOut: FinancialTransactionArquivo | undefined;
    if (formapagamentoId === ETransactionPaymentMethod.bankSlip) {
      const nomeRaw = value.boletoNomeArquivo;
      const nomeForm = nomeRaw !== null && nomeRaw !== undefined && String(nomeRaw).trim().length ? String(nomeRaw).trim() : "";
      if (nomeForm) {
        arquivoboletoOut = this.buildArquivoboletoForCommit(nomeForm, base);
      } else {
        arquivoboletoOut = undefined;
      }
    } else {
      arquivoboletoOut = undefined;
    }

    const arquivosOut = this.cloneArquivosList(this.arquivosDraft);

    let valortotalOut = base.valortotal;
    let numparcelasOut = base.numparcelas;
    let parcelasOut: FinancialTransactionParcela[] = base.parcelas ? base.parcelas.slice() : [];

    if (periodoId === this.PERIODO_VALOR_UNICO) {
      valortotalOut = this.parseNumber(value.valortotal, 0);
      numparcelasOut = 1;
      parcelasOut = [];
    } else if (periodoId === this.PERIODO_PARCELADO) {
      numparcelasOut = this.parsePositiveInt(value.numparcelas, 1);
      if (numparcelasOut > 60) {
        numparcelasOut = 60;
      }
      parcelasOut = this.buildParcelasPayloadFromForm(value, base);
      valortotalOut = this.sumParcelaValores(parcelasOut);
    }

    const payload: FinancialTransaction = Object.assign({}, base, {
      descricao: value.descricao ? value.descricao : "",
      datarecebimento: value.datarecebimento ? value.datarecebimento : "",
      datavencimento: value.datavencimento ? value.datavencimento : "",
      datarealizado: value.datarealizado ? value.datarealizado : "",
      datacobranca: value.datacobranca ? value.datacobranca : "",
      idcategoria: categoria && categoria.idcategoria ? categoria.idcategoria : base.idcategoria,
      categoria: categoria,
      idcontabancaria: idcontabancaria,
      contabancaria: contabancaria,
      idcontabancariacartaocredito: idcontabancariacartaocredito,
      contabancariacartaocredito: contabancariacartaocredito,
      formapagamento: formapagamentoId,
      periodo: periodoId,
      valortotal: valortotalOut,
      numparcelas: numparcelasOut,
      parcelas: parcelasOut,
      banco: bancoVal,
      agencia: agenciaVal,
      contacorrente: contacorrenteVal,
      chavepix: chavepixVal,
      arquivoboleto: arquivoboletoOut,
      arquivos: arquivosOut,
      observacao: value.observacao ? value.observacao : "",
      tags: this.cloneTagList(this.tagsDraft)
    });

    const self = this;
    this.loadingSubmit = true;
    const saveRequest =
      payload.idtransacao && payload.idtransacao > 0
        ? this.financialService.updateTransaction(payload)
        : this.financialService.createTransaction(payload);

    saveRequest.subscribe(
      function (saved) {
        self.loadingSubmit = false;
        self.submitted = false;
        self.snackBar.open("Lançamento salvo com sucesso.", "", {
          duration: 3000
        });
        self.saved.emit(saved);
      },
      function () {
        self.loadingSubmit = false;
        self.submitted = false;
      }
    );
  }

  private buildForm(): void {
    const defaultFormaPagamento = this.findOptionById(this.formasPagamento, ETransactionPaymentMethod.pix);
    const defaultPeriodo = this.findOptionById(this.periodos, this.PERIODO_VALOR_UNICO);
    this.form = new FormGroup({
      descricao: new FormControl("", [Validators.required]),
      datarecebimento: new FormControl("", [Validators.required]),
      datavencimento: new FormControl("", [Validators.required]),
      datarealizado: new FormControl("", [Validators.required]),
      datacobranca: new FormControl("", [Validators.required]),
      categoria: new FormControl(null, [Validators.required]),
      contabancaria: new FormControl(null, [Validators.required]),
      contabancariacartaocredito: new FormControl(null),
      formapagamento: new FormControl(defaultFormaPagamento, [Validators.required]),
      periodo: new FormControl(defaultPeriodo, [Validators.required]),
      valortotal: new FormControl(null, [Validators.required, this.minCurrencyValidator(0.01)]),
      numparcelas: new FormControl(1, [Validators.required, Validators.min(1), Validators.max(60)]),
      parcelas: new FormArray([]),
      banco: new FormControl(""),
      agencia: new FormControl(""),
      contacorrente: new FormControl("", [Validators.required]),
      chavepix: new FormControl("", [Validators.required]),
      boletoNomeArquivo: new FormControl(""),
      observacao: new FormControl("")
    });

    this.updateTransactionTypeValidators();
    this.updatePaymentMethodValidators();
    this.updatePeriodoValidators();
  }

  private patchFormFromTransaction(): void {
    if (!this.form || !this.transaction) {
      return;
    }

    const t = this.transaction;

    const parcelasCount = t.periodo === this.PERIODO_PARCELADO && t.numparcelas && t.numparcelas > 0 ? t.numparcelas : 1;

    this.form.patchValue(
      {
        descricao: t.descricao,
        datarecebimento: t.datarecebimento,
        datavencimento: t.datavencimento,
        datarealizado: t.datarealizado,
        datacobranca: t.datacobranca,
        categoria: t.categoria,
        contabancaria: t.contabancaria,
        contabancariacartaocredito: t.contabancariacartaocredito ? t.contabancariacartaocredito : null,
        formapagamento: this.findFormaPagamentoOption(t.formapagamento),
        periodo: this.findOptionById(this.periodos, t.periodo),
        valortotal: t.valortotal,
        numparcelas: parcelasCount,
        banco: t.banco,
        agencia: t.agencia,
        contacorrente: t.contacorrente,
        chavepix: t.chavepix,
        boletoNomeArquivo: this.getMainBoletoDisplayFromTransaction(t),
        observacao: t.observacao
      },
      { emitEvent: false }
    );

    this.updateTransactionTypeValidators();
    this.updatePaymentMethodValidators();
    this.updatePeriodoValidators();

    this.rebuildParcelasFromTransaction(t);

    this.tagsDraft = this.cloneTagList(t.tags);
    this.tagSectionKey++;

    this.arquivosDraft = this.cloneArquivosList(t.arquivos);
  }

  onTagsDraftChange(next: FinancialTransactionTag[]): void {
    this.tagsDraft = next;
  }

  hasControlError(controlName: string): boolean {
    if (!this.form) {
      return false;
    }
    const control = this.form.get(controlName);
    if (!control) {
      return false;
    }
    return !!(control.invalid && (control.touched || this.submitted));
  }

  getControlErrorMessage(controlName: string): string {
    if (!this.form) {
      return "";
    }
    const control = this.form.get(controlName);
    if (!control || !control.errors) {
      return "";
    }
    if (control.errors.required) {
      return "Campo obrigatório.";
    }
    if (control.errors.minCurrency) {
      return "Informe um valor.";
    }
    if (control.errors.min) {
      return "Valor abaixo do mínimo permitido.";
    }
    if (control.errors.max) {
      return "Valor acima do máximo permitido.";
    }
    return "Campo inválido.";
  }

  private cloneTagList(tags: FinancialTransactionTag[]): FinancialTransactionTag[] {
    const out: FinancialTransactionTag[] = [];
    if (!tags || !tags.length) {
      return out;
    }
    for (let i = 0; i < tags.length; i++) {
      const tag = tags[i];
      out.push({ idtag: tag.idtag, descricao: tag.descricao });
    }
    return out;
  }

  isDepositPayment(): boolean {
    return this.getSelectedFormaPagamentoId() === ETransactionPaymentMethod.deposit;
  }

  isPixPayment(): boolean {
    return this.getSelectedFormaPagamentoId() === ETransactionPaymentMethod.pix;
  }

  isCreditCardPayment(): boolean {
    return this.getSelectedFormaPagamentoId() === ETransactionPaymentMethod.creditCard;
  }

  isBankSlipPayment(): boolean {
    return this.getSelectedFormaPagamentoId() === ETransactionPaymentMethod.bankSlip;
  }

  isSingleValueLaunch(): boolean {
    return this.getSelectedPeriodoId() === this.PERIODO_VALOR_UNICO;
  }

  isInstallmentLaunch(): boolean {
    return this.getSelectedPeriodoId() === this.PERIODO_PARCELADO;
  }

  onBoletoFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input || !input.files || !input.files.length) {
      return;
    }
    const file = input.files[0];
    if (!file || !this.form) {
      return;
    }
    if (!this.isBoletoAcceptableFile(file)) {
      input.value = "";
      return;
    }
    this.applyBoletoFile(file);
    input.value = "";
  }

  onBoletoDragOver(event: DragEvent): void {
    if (!event.dataTransfer) {
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }

  onBoletoDragEnter(event: DragEvent): void {
    if (!event.dataTransfer) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.boletoDragEnterCount++;
    this.boletoDropzoneActive = true;
  }

  onBoletoDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.boletoDragEnterCount--;
    if (this.boletoDragEnterCount <= 0) {
      this.boletoDragEnterCount = 0;
      this.boletoDropzoneActive = false;
    }
  }

  onBoletoDrop(event: DragEvent): void {
    if (!event.dataTransfer || !this.form) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.boletoDragEnterCount = 0;
    this.boletoDropzoneActive = false;
    const files = event.dataTransfer.files;
    if (!files || !files.length) {
      return;
    }
    const file = files[0];
    if (!file) {
      return;
    }
    if (!this.isBoletoAcceptableFile(file)) {
      return;
    }
    this.applyBoletoFile(file);
  }

  openBoletoFilePicker(fileInput: HTMLInputElement): void {
    if (fileInput) {
      fileInput.click();
    }
  }

  removeBoletoArquivo(fileInput: HTMLInputElement): void {
    if (!this.form) {
      return;
    }
    const ctrl = this.form.get("boletoNomeArquivo");
    if (ctrl) {
      ctrl.setValue("");
    }
    if (fileInput) {
      fileInput.value = "";
    }
  }

  hasBoletoArquivo(): boolean {
    const ctrl = this.form && this.form.get("boletoNomeArquivo");
    const v = ctrl && ctrl.value;
    return !!(v && String(v).length);
  }

  getBoletoArquivoDisplayName(): string {
    const ctrl = this.form && this.form.get("boletoNomeArquivo");
    const v = ctrl && ctrl.value;
    if (!v) {
      return "";
    }
    const str = String(v);
    const parts = str.split(/[/\\]/);
    const last = parts[parts.length - 1];
    return last ? last : str;
  }

  private applyBoletoFile(file: File): void {
    if (!this.form) {
      return;
    }
    const ctrl = this.form.get("boletoNomeArquivo");
    if (ctrl) {
      ctrl.setValue(file.name);
    }
  }

  private getMainBoletoDisplayFromTransaction(t: FinancialTransaction): string {
    const ab = t.arquivoboleto;
    if (!ab) {
      return "";
    }
    if (ab.nomearquivo) {
      return ab.nomearquivo;
    }
    if (ab.diretorio) {
      const str = String(ab.diretorio);
      const parts = str.split(/[/\\]/);
      const last = parts[parts.length - 1];
      return last ? last : str;
    }
    return "";
  }

  private cloneArquivosList(src: FinancialTransactionArquivo[] | undefined): FinancialTransactionArquivo[] {
    const out: FinancialTransactionArquivo[] = [];
    if (!src || !src.length) {
      return out;
    }
    let i = 0;
    for (i = 0; i < src.length; i++) {
      const a = src[i];
      out.push({
        idarquivo: a.idarquivo,
        nomearquivo: a.nomearquivo,
        diretorio: a.diretorio,
        dataupload: a.dataupload
      });
    }
    return out;
  }

  private buildArquivoboletoForCommit(nomeForm: string, base: FinancialTransaction): FinancialTransactionArquivo {
    const baseAb = base.arquivoboleto;
    const idarquivo = baseAb && baseAb.idarquivo !== undefined && baseAb.idarquivo !== null ? baseAb.idarquivo : 0;
    const diretorio = baseAb && baseAb.diretorio ? baseAb.diretorio : nomeForm;
    const dataupload = baseAb && baseAb.dataupload ? baseAb.dataupload : "";
    return {
      idarquivo: idarquivo,
      nomearquivo: nomeForm,
      diretorio: diretorio,
      dataupload: dataupload
    };
  }

  trackByAnexoIndex(index: number, item: FinancialTransactionArquivo): string {
    const id = item && item.idarquivo !== undefined && item.idarquivo !== null ? item.idarquivo : 0;
    return String(id) + "-" + String(index);
  }

  onAnexosFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input || !input.files || !input.files.length) {
      return;
    }
    this.addAnexosFromFileList(input.files);
    input.value = "";
  }

  onAnexosDragOver(event: DragEvent): void {
    if (!event.dataTransfer) {
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }

  onAnexosDragEnter(event: DragEvent): void {
    if (!event.dataTransfer) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.anexosDragEnterCount++;
    this.anexosDropzoneActive = true;
  }

  onAnexosDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.anexosDragEnterCount--;
    if (this.anexosDragEnterCount <= 0) {
      this.anexosDragEnterCount = 0;
      this.anexosDropzoneActive = false;
    }
  }

  onAnexosDrop(event: DragEvent): void {
    if (!event.dataTransfer) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.anexosDragEnterCount = 0;
    this.anexosDropzoneActive = false;
    const files = event.dataTransfer.files;
    if (!files || !files.length) {
      return;
    }
    this.addAnexosFromFileList(files);
  }

  openAnexosFilePicker(fileInput: HTMLInputElement): void {
    if (fileInput) {
      fileInput.click();
    }
  }

  removeAnexoAt(index: number, fileInput: HTMLInputElement): void {
    if (index < 0 || !this.arquivosDraft || index >= this.arquivosDraft.length) {
      return;
    }
    this.arquivosDraft = this.arquivosDraft.slice(0, index).concat(this.arquivosDraft.slice(index + 1));
    if (fileInput) {
      fileInput.value = "";
    }
  }

  private addAnexosFromFileList(files: FileList): void {
    if (!files || !files.length) {
      return;
    }
    let i = 0;
    for (i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file || !this.isAnexoAcceptableFile(file)) {
        continue;
      }
      this.arquivosDraft = this.arquivosDraft.concat([this.createArquivoFromLocalFile(file)]);
    }
  }

  /**
   * Anexos: ampla liberdade de tipos; bloqueia só extensões típicas de executável/script no Windows.
   */
  private isAnexoAcceptableFile(file: File): boolean {
    if (!file) {
      return false;
    }
    const name = file.name ? String(file.name).trim() : "";
    if (!name.length) {
      return false;
    }
    const ext = this.getExtensionLower(name);
    if (ext && this.isBlockedAnexoExtension(ext)) {
      return false;
    }
    return true;
  }

  private getExtensionLower(fileName: string): string {
    const n = fileName.toLowerCase();
    const d = n.lastIndexOf(".");
    if (d < 0 || d >= n.length - 1) {
      return "";
    }
    return n.substring(d);
  }

  private isBlockedAnexoExtension(ext: string): boolean {
    const blocked = [
      ".exe",
      ".bat",
      ".cmd",
      ".com",
      ".msi",
      ".scr",
      ".pif",
      ".vbs",
      ".vbe",
      ".ws",
      ".wsf",
      ".wsh",
      ".hta",
      ".ps1",
      ".ps1xml",
      ".psm1",
      ".psc1",
      ".psc2",
      ".dll",
      ".msc",
      ".cpl",
      ".reg",
      ".lnk",
      ".application",
      ".appref-ms",
      ".gadget",
      ".msp",
      ".xbap",
      ".app"
    ];
    let i = 0;
    for (i = 0; i < blocked.length; i++) {
      if (ext === blocked[i]) {
        return true;
      }
    }
    return false;
  }

  private createArquivoFromLocalFile(file: File): FinancialTransactionArquivo {
    const nome = file.name ? file.name : "arquivo";
    return {
      idarquivo: 0,
      nomearquivo: nome,
      diretorio: nome,
      dataupload: ""
    };
  }

  private isBoletoAcceptableFile(file: File): boolean {
    if (!file) {
      return false;
    }
    const name = file.name ? file.name.toLowerCase() : "";
    if (name.length >= 4 && name.substr(name.length - 4) === ".pdf") {
      return true;
    }
    if (file.type && file.type.indexOf("image/") === 0) {
      return true;
    }
    if (file.type === "application/pdf") {
      return true;
    }
    return false;
  }

  private getSelectedFormaPagamentoId(): number | null {
    if (!this.form) {
      return null;
    }
    const ctrl = this.form.get("formapagamento");
    if (!ctrl) {
      return null;
    }
    const val = ctrl.value;
    if (!val) {
      return null;
    }
    if (val.id !== undefined && val.id !== null) {
      return val.id;
    }
    return null;
  }

  private bindParcelamentoListeners(): void {
    const numCtrl = this.form.get("numparcelas");
    if (numCtrl) {
      this.numParcelasSub = numCtrl.valueChanges.subscribe(() => {
        if (this.getSelectedPeriodoId() === this.PERIODO_PARCELADO) {
          this.syncParcelasToCount(numCtrl.value);
        }
      });
    }
    const perCtrl = this.form.get("periodo");
    if (perCtrl) {
      this.periodoSub = perCtrl.valueChanges.subscribe(() => {
        this.onPeriodoSelectionChanged();
        this.updatePeriodoValidators();
      });
    }
    const formaCtrl = this.form.get("formapagamento");
    if (formaCtrl) {
      this.formaPagamentoSub = formaCtrl.valueChanges.subscribe(() => {
        this.updatePaymentMethodValidators();
      });
    }
  }

  private onPeriodoSelectionChanged(): void {
    if (!this.form) {
      return;
    }
    if (this.getSelectedPeriodoId() === this.PERIODO_PARCELADO) {
      const numCtrl = this.form.get("numparcelas");
      let n = numCtrl && numCtrl.value !== null && numCtrl.value !== undefined ? parseInt(String(numCtrl.value), 10) : 1;
      if (isNaN(n) || n < 1) {
        n = 1;
        if (numCtrl) {
          numCtrl.setValue(n, { emitEvent: false });
        }
      }
      this.syncParcelasToCount(n);
    }
  }

  private syncParcelasToCount(rawCount: any): void {
    if (!this.form) {
      return;
    }
    let count = parseInt(String(rawCount), 10);
    if (isNaN(count) || count < 1) {
      count = 1;
    }
    if (count > 60) {
      count = 60;
    }
    const arr = this.form.get("parcelas") as FormArray;
    if (!arr) {
      return;
    }

    while (arr.length < count) {
      arr.push(this.createParcelaFormGroup(arr.length + 1));
    }
    while (arr.length > count) {
      arr.removeAt(arr.length - 1);
    }

    let i = 0;
    for (i = 0; i < arr.length; i++) {
      const g = arr.at(i) as FormGroup;
      const ord = g.get("ordem");
      if (ord) {
        ord.setValue(i + 1, { emitEvent: false });
      }
    }
  }

  private rebuildParcelasFromTransaction(t: FinancialTransaction): void {
    const arr = this.form.get("parcelas") as FormArray;
    if (!arr) {
      return;
    }
    while (arr.length) {
      arr.removeAt(0);
    }

    if (t.periodo !== this.PERIODO_PARCELADO) {
      return;
    }

    const list = t.parcelas ? t.parcelas.slice() : [];
    list.sort(function (a, b) {
      return a.ordem - b.ordem;
    });

    let count = t.numparcelas && t.numparcelas > 0 ? t.numparcelas : list.length;
    if (!count || count < 1) {
      count = 1;
    }
    if (count > 60) {
      count = 60;
    }

    let i = 0;
    for (i = 0; i < count; i++) {
      const p = list[i];
      if (p) {
        arr.push(this.createParcelaFormGroupFromModel(p, i + 1));
      } else {
        arr.push(this.createParcelaFormGroup(i + 1));
      }
    }

    const numCtrl = this.form.get("numparcelas");
    if (numCtrl) {
      numCtrl.setValue(count, { emitEvent: false });
    }
  }

  private createParcelaFormGroup(ordem: number): FormGroup {
    return new FormGroup({
      idparcela: new FormControl(0),
      idtransacao: new FormControl(0),
      valor: new FormControl(0, [Validators.required, this.minCurrencyValidator(0.01)]),
      data: new FormControl("", [Validators.required]),
      ordem: new FormControl(ordem)
    });
  }

  private createParcelaFormGroupFromModel(p: FinancialTransactionParcela, ordemFallback: number): FormGroup {
    return new FormGroup({
      idparcela: new FormControl(p.idparcela),
      idtransacao: new FormControl(p.idtransacao),
      valor: new FormControl(p.valor, [Validators.required]),
      data: new FormControl(this.parcelaDateToFormValue(p.data), [Validators.required]),
      ordem: new FormControl(p.ordem ? p.ordem : ordemFallback)
    });
  }

  private updateTransactionTypeValidators(): void {
    if (!this.form) {
      return;
    }
    const dataRecebimento = this.form.get("datarecebimento");
    const dataVencimento = this.form.get("datavencimento");
    const dataRealizado = this.form.get("datarealizado");
    const dataCobranca = this.form.get("datacobranca");

    if (dataCobranca) {
      dataCobranca.setValidators([Validators.required]);
      dataCobranca.updateValueAndValidity({ emitEvent: false });
    }

    if (this.isExpenseForm) {
      if (dataVencimento) {
        dataVencimento.setValidators([Validators.required]);
        dataVencimento.updateValueAndValidity({ emitEvent: false });
      }
      if (dataRealizado) {
        dataRealizado.setValidators([Validators.required]);
        dataRealizado.updateValueAndValidity({ emitEvent: false });
      }
      if (dataRecebimento) {
        dataRecebimento.clearValidators();
        dataRecebimento.updateValueAndValidity({ emitEvent: false });
      }
      return;
    }

    if (dataRecebimento) {
      dataRecebimento.setValidators([Validators.required]);
      dataRecebimento.updateValueAndValidity({ emitEvent: false });
    }
    if (dataVencimento) {
      dataVencimento.clearValidators();
      dataVencimento.updateValueAndValidity({ emitEvent: false });
    }
    if (dataRealizado) {
      dataRealizado.clearValidators();
      dataRealizado.updateValueAndValidity({ emitEvent: false });
    }
  }

  private updatePaymentMethodValidators(): void {
    if (!this.form) {
      return;
    }

    const formapagamentoId = this.getSelectedFormaPagamentoId();
    const chavepix = this.form.get("chavepix");
    const boletoNomeArquivo = this.form.get("boletoNomeArquivo");
    const contabancariacartaocredito = this.form.get("contabancariacartaocredito");
    const banco = this.form.get("banco");
    const agencia = this.form.get("agencia");
    const contacorrente = this.form.get("contacorrente");

    if (chavepix) {
      chavepix.setValidators(formapagamentoId === ETransactionPaymentMethod.pix ? [Validators.required] : []);
      chavepix.updateValueAndValidity({ emitEvent: false });
    }

    if (boletoNomeArquivo) {
      boletoNomeArquivo.setValidators(formapagamentoId === ETransactionPaymentMethod.bankSlip ? [Validators.required] : []);
      boletoNomeArquivo.updateValueAndValidity({ emitEvent: false });
    }

    if (contabancariacartaocredito) {
      contabancariacartaocredito.setValidators(formapagamentoId === ETransactionPaymentMethod.creditCard ? [Validators.required] : []);
      contabancariacartaocredito.updateValueAndValidity({ emitEvent: false });
    }

    const isDeposit = formapagamentoId === ETransactionPaymentMethod.deposit;
    if (banco) {
      banco.setValidators(isDeposit ? [Validators.required] : []);
      banco.updateValueAndValidity({ emitEvent: false });
    }
    if (agencia) {
      agencia.setValidators(isDeposit ? [Validators.required] : []);
      agencia.updateValueAndValidity({ emitEvent: false });
    }
    if (contacorrente) {
      contacorrente.setValidators(isDeposit ? [Validators.required] : []);
      contacorrente.updateValueAndValidity({ emitEvent: false });
    }
  }

  private updatePeriodoValidators(): void {
    if (!this.form) {
      return;
    }
    const periodoId = this.getSelectedPeriodoId();
    const valortotal = this.form.get("valortotal");
    const numparcelas = this.form.get("numparcelas");
    const parcelas = this.form.get("parcelas");
    const isSingle = periodoId === this.PERIODO_VALOR_UNICO;
    const isInstallment = periodoId === this.PERIODO_PARCELADO;

    if (valortotal) {
      valortotal.setValidators(isSingle ? [Validators.required, this.minCurrencyValidator(0.01)] : []);
      valortotal.updateValueAndValidity({ emitEvent: false });
    }

    if (numparcelas) {
      numparcelas.setValidators(isInstallment ? [Validators.required, Validators.min(1), Validators.max(60)] : []);
      numparcelas.updateValueAndValidity({ emitEvent: false });
    }

    if (parcelas) {
      parcelas.setValidators(isInstallment ? [Validators.required] : []);
      parcelas.updateValueAndValidity({ emitEvent: false });
    }
  }

  private minCurrencyValidator(min: number): ValidatorFn {
    return function (control: AbstractControl): ValidationErrors | null {
      const raw = control ? control.value : null;
      if (raw === null || raw === undefined || raw === "") {
        return null;
      }
      let parsed = 0;
      if (typeof raw === "number") {
        parsed = raw;
      } else {
        let s = String(raw)
          .replace(/R\$\s*/g, "")
          .trim();
        if (!s.length) {
          parsed = 0;
        } else {
          s = s.replace(/\./g, "").replace(",", ".");
          const n = parseFloat(s);
          parsed = isNaN(n) ? 0 : n;
        }
      }
      if (parsed < min) {
        return { minCurrency: { min: min, actual: parsed } };
      }
      return null;
    };
  }

  private parcelaDateToFormValue(iso: string): string {
    if (!iso) {
      return "";
    }
    const tIdx = iso.indexOf("T");
    if (tIdx > 0) {
      return iso.substring(0, tIdx);
    }
    const spaceIdx = iso.indexOf(" ");
    if (spaceIdx > 0) {
      return iso.substring(0, spaceIdx);
    }
    return iso;
  }

  private formatParcelaDateForApi(v: string): string {
    if (!v) {
      return "";
    }
    if (v.indexOf("T") >= 0) {
      return v;
    }
    return v + "T00:00:00";
  }

  private getSelectedPeriodoId(): number | null {
    if (!this.form) {
      return null;
    }
    const ctrl = this.form.get("periodo");
    if (!ctrl) {
      return null;
    }
    const val = ctrl.value;
    if (!val) {
      return null;
    }
    if (val.id !== undefined && val.id !== null) {
      return val.id;
    }
    return null;
  }

  private parsePositiveInt(raw: any, fallback: number): number {
    const n = parseInt(String(raw), 10);
    if (isNaN(n) || n < 1) {
      return fallback;
    }
    return n;
  }

  private parseNumber(raw: any, fallback: number): number {
    if (raw === null || raw === undefined || raw === "") {
      return fallback;
    }
    if (typeof raw === "number") {
      return isNaN(raw) ? fallback : raw;
    }
    let s = String(raw)
      .replace(/R\$\s*/g, "")
      .trim();
    if (!s.length) {
      return fallback;
    }
    s = s.replace(/\./g, "").replace(",", ".");
    const parsed = parseFloat(s);
    if (isNaN(parsed)) {
      return fallback;
    }
    return parsed;
  }

  private buildParcelasPayloadFromForm(value: any, base: FinancialTransaction): FinancialTransactionParcela[] {
    const raw = value.parcelas;
    const out: FinancialTransactionParcela[] = [];
    if (!raw || !raw.length) {
      return out;
    }
    let idx = 0;
    for (idx = 0; idx < raw.length; idx++) {
      const row = raw[idx];
      const valor = this.parseNumber(row.valor, 0);
      const dataStr = row.data && String(row.data).length ? this.formatParcelaDateForApi(String(row.data)) : "";
      const idparcela = row.idparcela !== undefined && row.idparcela !== null ? row.idparcela : 0;
      out.push({
        idparcela: idparcela,
        idtransacao: base.idtransacao,
        valor: valor,
        data: dataStr,
        ordem: idx + 1
      });
    }
    return out;
  }

  private sumParcelaValores(parcelas: FinancialTransactionParcela[]): number {
    let sum = 0;
    let i = 0;
    for (i = 0; i < parcelas.length; i++) {
      const v = parcelas[i].valor;
      if (typeof v === "number" && !isNaN(v)) {
        sum += v;
      }
    }
    return sum;
  }

  private findOptionById(options: Array<{ id: number; nome: string }>, id: number): { id: number; nome: string } | null {
    if (!options || options.length === 0) {
      return null;
    }

    for (let i = 0; i < options.length; i++) {
      if (options[i].id === id) {
        return options[i];
      }
    }

    return options[0];
  }

  private findFormaPagamentoOption(id: number): { id: number; nome: string } | null {
    if (!this.formasPagamento || !this.formasPagamento.length) {
      return null;
    }
    let i = 0;
    for (i = 0; i < this.formasPagamento.length; i++) {
      if (this.formasPagamento[i].id === id) {
        return this.formasPagamento[i];
      }
    }
    for (i = 0; i < this.formasPagamento.length; i++) {
      if (this.formasPagamento[i].id === ETransactionPaymentMethod.pix) {
        return this.formasPagamento[i];
      }
    }
    return this.formasPagamento[0];
  }

  openCategoryModal(): void {
    this.dialog.open(CategoryModalComponent, {
      width: "400px",
      panelClass: "beautiful-modal"
    });
  }

  openBankAccountModal(targetControlName: "contabancaria" | "contabancariacartaocredito"): void {
    const dialogRef = this.dialog.open(BankAccountModalComponent, {
      width: "490px",
      panelClass: "beautiful-modal"
    });

    dialogRef.afterClosed().subscribe((result: BankAccountModalResult | undefined) => {
      if (!result || !result.account) {
        return;
      }

      const createdAccount = Object.assign({}, result.account, {
        idcontabancaria: this.getNextBankAccountId(this.accounts)
      });

      this.accounts = (this.accounts || []).concat([createdAccount]);

      if (this.form) {
        const targetControl = this.form.get(targetControlName);
        if (targetControl) {
          targetControl.setValue(createdAccount);
          targetControl.markAsTouched();
          targetControl.updateValueAndValidity({ emitEvent: false });
        }
      }
    });
  }

  private getNextBankAccountId(accounts: BankAccount[]): number {
    if (!accounts || !accounts.length) {
      return 1;
    }
    let max = accounts[0].id;
    let i = 1;
    for (i = 1; i < accounts.length; i++) {
      if (accounts[i].id > max) {
        max = accounts[i].id;
      }
    }
    return max + 1;
  }
}
