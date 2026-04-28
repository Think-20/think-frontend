import { Component, Inject, OnInit, Optional } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { BankAccountType } from "app/bank-account-types/bank-account-type.model";
import { BankAccountTypeService } from "app/bank-account-types/bank-account-type.service";
import { BankAccount } from "app/bank-accounts/bank-account.model";
import { Bank } from "app/banks/bank.model";
import { BankService } from "app/banks/bank.service";
import { EBank } from "app/shared/enums/bank.enum";
import { BankAccountService } from "app/shared/services/bank-account.service";
import { forkJoin } from "rxjs";

export interface BankAccountModalData {
  account?: BankAccount;
}

export interface BankAccountModalResult {
  account: BankAccount;
}

@Component({
  selector: "cb-bank-account-modal",
  templateUrl: "./bank-account-modal.component.html",
  styleUrls: ["./bank-account-modal.component.scss"]
})
export class BankAccountModalComponent implements OnInit {
  submitted = false;
  loading = false;

  banks: Bank[] = [];
  bankAccountTypes: BankAccountType[] = [];

  bankEnum = EBank;

  form = new FormGroup({
    name: new FormControl(null, [Validators.required, Validators.minLength(3), Validators.maxLength(50)]),
    agency: new FormControl(null, [Validators.required, Validators.pattern(/^\d{4}$/)]),
    account_number: new FormControl(null, [Validators.required, Validators.pattern(/^\d{5,12}-?[\dXx]?$/)]),
    bank: new FormControl(null, [Validators.required]),
    bank_account_type: new FormControl(null, [Validators.required])
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

  get accountNumber(): FormControl {
    return this.form.get("account_number") as FormControl;
  }

  get bankAccountType(): FormControl {
    return this.form.get("bank_account_type") as FormControl;
  }

  constructor(
    private snackBar: MatSnackBar,
    private bankService: BankService,
    private bankAccountService: BankAccountService,
    private bankAccountTypeService: BankAccountTypeService,
    public dialog: MatDialogRef<BankAccountModalComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) private dialogData: BankAccountModalData
  ) {
    this.patchFormWithDialogData();
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const snackBarRef = this.snackBar.open("Carregando...", "");

    forkJoin([this.bankService.banks(), this.bankAccountTypeService.bankAccountTypes()]).subscribe(
      ([banks, bankAccountTypes]) => {
        this.banks = banks;
        this.bankAccountTypes = bankAccountTypes;

        snackBarRef.dismiss();
      },
      (error) => {
        snackBarRef.dismiss();

        this.snackBar.open("Erro ao carregar dados.", "", {
          duration: 3000
        });
      }
    );
  }

  hasControlError(control: FormControl): boolean {
    if (!control) {
      return false;
    }
    return !!(control.invalid && (this.submitted || control.touched));
  }

  getControlErrorMessage(control: FormControl): string {
    if (!control || !control.errors) {
      return "";
    }
    if (control.errors.required) {
      return "Campo obrigatório.";
    }
    if (control.errors.minlength) {
      return "Informe ao menos 3 caracteres.";
    }
    if (control.errors.maxlength) {
      return "Informe no máximo 50 caracteres.";
    }
    if (control.errors.pattern) {
      return "Formato inválido.";
    }
    return "Campo inválido.";
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
      this.snackBar.open("Por favor, preencha todos os campos obrigatórios.", "", {
        duration: 3000
      });

      return;
    }

    if (this.loading) {
      return;
    }

    this.loading = true;

    const accountPayload = this.buildResultAccount();

    const request$ = this.isEditMode ? this.bankAccountService.put(accountPayload) : this.bankAccountService.post(accountPayload);

    let snackBarStateCharging = this.snackBar.open("Salvando...");

    request$.subscribe(
      function (response) {
        snackBarStateCharging.dismiss();

        this.loading = false;

        if (!response.status) {
          this.snackBar.open(response.message, "", {
            duration: 3000
          });

          return;
        }

        this.dialog.close({ account: response.bankAccount } as BankAccountModalResult);
      }.bind(this),
      function () {
        snackBarStateCharging.dismiss();

        this.loading = false;
      }.bind(this)
    );
  }

  private patchFormWithDialogData(): void {
    if (!this.dialogData || !this.dialogData.account) {
      return;
    }
    const account = this.dialogData.account;
    this.form.patchValue(account);
  }

  private buildResultAccount(): BankAccount {
    const account = this.dialogData && this.dialogData.account ? this.dialogData.account : null;

    return {
      ...this.form.value,
      ...(account && account.id ? { id: account.id } : {}),
      bank_id: this.bank.value.id,
      bank_account_type_id: this.bankAccountType.value.id
    } as BankAccount;
  }
}
