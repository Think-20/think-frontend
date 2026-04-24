import { Component, EventEmitter, HostListener, Input, Output } from "@angular/core";
import { MatDialog } from "@angular/material";
import Swal from "sweetalert2";
import { BankAccountModalComponent, BankAccountModalResult } from "../bank-account-modal/bank-account-modal.component";
import { banks } from "app/shared/enums/bank.enum";
import { FinancialTransactionBankAccount } from "app/shared/models/financial-transaction.model";

@Component({
  selector: "cb-bank-accounts",
  templateUrl: "./bank-accounts.component.html",
  styleUrls: ["./bank-accounts.component.scss"]
})
export class BankAccountsComponent {
  banks = banks;

  @Input() open = false;

  @Input() accounts: FinancialTransactionBankAccount[] = [];

  @Input() selectedAccountId: number | null = null;

  @Output() openChange = new EventEmitter<boolean>();

  @Output() selectedAccountChange = new EventEmitter<FinancialTransactionBankAccount | null>();

  @Output() accountsChange = new EventEmitter<FinancialTransactionBankAccount[]>();

  constructor(private dialog: MatDialog) {}

  @HostListener("document:keydown", ["$event"])
  handleDocumentKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape" && this.open) {
      this.closePanel();
    }
  }

  closePanel(): void {
    this.openChange.emit(false);
  }

  createAccount(): void {
    const dialogRef = this.dialog.open(BankAccountModalComponent, {
      width: "490px",
      panelClass: "beautiful-modal",
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe(
      function (result: BankAccountModalResult) {
        if (!result || !result.account) {
          return;
        }
        const nextId = this.resolveNextId(this.accounts);
        const createdAccount = Object.assign({}, result.account, { idcontabancaria: nextId });
        this.accountsChange.emit(this.accounts.concat(createdAccount));
        this.selectedAccountChange.emit(createdAccount);
      }.bind(this)
    );
  }

  editAccount(account: FinancialTransactionBankAccount): void {
    const dialogRef = this.dialog.open(BankAccountModalComponent, {
      width: "490px",
      panelClass: "beautiful-modal",
      autoFocus: false,
      data: { account: account }
    });
    dialogRef.afterClosed().subscribe(
      function (result: BankAccountModalResult) {
        if (!result || !result.account) {
          return;
        }
        const editedAccount = Object.assign({}, account, result.account);
        const updated = this.accounts.map(function (current) {
          if (current.idcontabancaria === editedAccount.idcontabancaria) {
            return editedAccount;
          }
          return current;
        });
        this.accountsChange.emit(updated);
        if (this.selectedAccountId === editedAccount.idcontabancaria) {
          this.selectedAccountChange.emit(editedAccount);
        }
      }.bind(this)
    );
  }

  deleteAccount(account: FinancialTransactionBankAccount): void {
    Swal.fire({
      title: "Excluir conta bancária?",
      text: "Essa ação não poderá ser desfeita.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
      customClass: {
        popup: "sweetalert-custom"
      }
    }).then(
      function (result) {
        if (!result || !result.value) {
          return;
        }
        const updated = this.accounts.filter(function (current) {
          return current.idcontabancaria !== account.idcontabancaria;
        });
        this.accountsChange.emit(updated);

        if (this.selectedAccountId === account.idcontabancaria) {
          if (updated.length > 0) {
            this.selectedAccountChange.emit(updated[0]);
          } else {
            this.selectedAccountChange.emit(null);
          }
        }
      }.bind(this)
    );
  }

  selectAccount(account: FinancialTransactionBankAccount): void {
    this.selectedAccountChange.emit(account);
    this.closePanel();
  }

  trackByAccountId(index: number, account: FinancialTransactionBankAccount): number {
    return account.idcontabancaria;
  }

  isSelected(account: FinancialTransactionBankAccount): boolean {
    return this.selectedAccountId === account.idcontabancaria;
  }

  resolveBankName(code: string): string {
    const bankData = banks.get(code as any);
    if (!bankData) {
      return "Banco";
    }
    return bankData.name;
  }

  private resolveNextId(accounts: FinancialTransactionBankAccount[]): number {
    if (!accounts.length) {
      return 1;
    }
    let max = accounts[0].idcontabancaria;
    for (let i = 1; i < accounts.length; i++) {
      if (accounts[i].idcontabancaria > max) {
        max = accounts[i].idcontabancaria;
      }
    }
    return max + 1;
  }
}
