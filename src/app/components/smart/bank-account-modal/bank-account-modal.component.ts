import { Component, Inject, Optional } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { EBank, banks } from "app/shared/enums/bank.enum";
import { FinancialTransactionBankAccount } from "app/shared/models/financial-transaction.model";

export interface BankAccountModalData {
  account?: FinancialTransactionBankAccount;
}

export interface BankAccountModalResult {
  account: FinancialTransactionBankAccount;
}

@Component({
  selector: "cb-bank-account-modal",
  templateUrl: "./bank-account-modal.component.html",
  styleUrls: ["./bank-account-modal.component.scss"],
})
export class BankAccountModalComponent {
  submitted = false;

  banks = Array.from(banks.values());

  form = new FormGroup({
    bank: new FormControl(null, [Validators.required]),
    name: new FormControl(null, [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(50),
    ]),
    agency: new FormControl(null, [
      Validators.required,
      Validators.pattern(/^\d{4}$/),
    ]),
    account: new FormControl(null, [
      Validators.required,
      Validators.pattern(/^\d{5,12}-?[\dXx]?$/),
    ]),
  });

  get bank(): FormControl {
    return this.form.get("bank") as FormControl;
  }

  get name(): FormControl {
    return this.form.get("name") as FormControl;
  }

  get agency(): FormControl {
    return this.form.get("agency") as FormControl;
  }

  get account(): FormControl {
    return this.form.get("account") as FormControl;
  }

  constructor(
    public dialog: MatDialogRef<BankAccountModalComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) private dialogData: BankAccountModalData
  ) {
    this.patchFormWithDialogData();
  }

  get isEditMode(): boolean {
    return !!(this.dialogData && this.dialogData.account);
  }

  get modalTitle(): string {
    if (this.isEditMode) {
      return "Editar conta bancária";
    }
    return "Cadastrar conta bancária";
  }

  close(): void {
    this.dialog.close();
  }

  save(): void {
    this.submitted = true;
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    this.dialog.close({ account: this.buildResultAccount() } as BankAccountModalResult);
  }

  private patchFormWithDialogData(): void {
    if (!this.dialogData || !this.dialogData.account) {
      return;
    }
    const account = this.dialogData.account;
    this.form.patchValue({
      bank: this.findBankByCode(account.banco),
      name: account.nome,
      agency: account.agencia,
      account: account.conta
    });
  }

  private findBankByCode(code: string): { code: string; name: string; image: string } | null {
    for (let i = 0; i < this.banks.length; i++) {
      const bank = this.banks[i];
      if (bank.code === code) {
        return bank;
      }
    }
    return null;
  }

  private buildResultAccount(): FinancialTransactionBankAccount {
    const previous = this.dialogData && this.dialogData.account ? this.dialogData.account : null;
    const bankValue = this.bank.value;
    return {
      idcontabancaria: previous ? previous.idcontabancaria : 0,
      nome: this.name.value,
      banco: bankValue && bankValue.code ? bankValue.code : EBank.nubank,
      agencia: this.agency.value,
      conta: this.account.value,
      datacadastro: previous && previous.datacadastro ? previous.datacadastro : new Date().toISOString()
    };
  }
}
