import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialog } from "@angular/material";
import { BankAccount } from "app/bank-accounts/bank-account.model";
import { Pagination } from "app/shared/pagination.model";
import { banks, EBank } from "app/shared/enums/bank.enum";
import { BankAccountService } from "app/shared/services/bank-account.service";
import { Subscription } from "rxjs";
import Swal from "sweetalert2";
import { BankAccountModalComponent, BankAccountModalResult } from "../bank-account-modal/bank-account-modal.component";

@Component({
  selector: "cb-bank-accounts",
  templateUrl: "./bank-accounts.component.html",
  styleUrls: ["./bank-accounts.component.scss"]
})
export class BankAccountsComponent implements OnInit, OnChanges, OnDestroy {
  bankEnum = EBank;

  @ViewChildren("accountRow") accountRowRefs: QueryList<ElementRef>;

  @Input() open = false;

  @Input() accounts: BankAccount[] = [];

  @Input() selectedAccount: BankAccount | null = null;

  @Output() openChange = new EventEmitter<boolean>();

  @Output() selectedAccountChange = new EventEmitter<BankAccount | null>();
  searchControl = new FormControl("");
  listLoading = false;
  pagination: Pagination<BankAccount> = {
    current_page: 1,
    data: [],
    from: 0,
    last_page: 1,
    next_page_url: null as any,
    path: "",
    per_page: 20,
    prev_page_url: "",
    to: 0,
    total: 0
  };
  private internalSearch = "";
  private searchSub: Subscription | null = null;
  private searchDebounceTimer: number | null = null;
  private readonly searchDebounceMs = 300;

  /** Índice da linha destacada pela navegação com setas (-1 = nenhuma). */
  activeListIndex = -1;

  constructor(private dialog: MatDialog, private bankAccountService: BankAccountService) {}

  ngOnInit(): void {
    this.searchSub = this.searchControl.valueChanges.subscribe(
      function (value: string) {
        this.onSearchChange(value);
      }.bind(this)
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.open) {
      if (this.open) {
        this.loadAccountsPage(1);
      } else {
        this.activeListIndex = -1;
      }
    }
  }

  ngOnDestroy(): void {
    if (this.searchSub) {
      this.searchSub.unsubscribe();
      this.searchSub = null;
    }
    this.clearSearchDebounceTimer();
  }

  @HostListener("document:keydown", ["$event"])
  handleDocumentKeydown(event: KeyboardEvent): void {
    if (!this.open) {
      return;
    }

    if (event.key === "Escape") {
      this.closePanel();
      return;
    }

    if (this.shouldIgnoreListKeyboardShortcuts(event)) {
      return;
    }

    if (!this.accounts.length || this.listLoading) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (this.activeListIndex < 0) {
        this.setActiveListIndex(0);
      } else {
        this.setActiveListIndex(Math.min(this.activeListIndex + 1, this.accounts.length - 1));
      }
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (this.activeListIndex < 0) {
        this.setActiveListIndex(this.accounts.length - 1);
      } else {
        this.setActiveListIndex(Math.max(this.activeListIndex - 1, 0));
      }
      return;
    }

    if (event.key === "Enter") {
      if (this.activeListIndex >= 0 && this.activeListIndex < this.accounts.length) {
        event.preventDefault();
        this.selectAccount(this.accounts[this.activeListIndex]);
      }
    }
  }

  closePanel(): void {
    this.openChange.emit(false);
  }

  onSearchChange(value: string): void {
    this.internalSearch = value ? String(value).trim() : "";
    this.clearSearchDebounceTimer();
    this.searchDebounceTimer = window.setTimeout(
      function () {
        this.searchDebounceTimer = null;
        this.loadAccountsPage(1);
      }.bind(this),
      this.searchDebounceMs
    );
  }

  loadAccountsPage(page: number): void {
    this.listLoading = true;
    this.bankAccountService.get(page, this.internalSearch).subscribe(
      function (response) {
        this.listLoading = false;
        if (!response || !response.pagination) {
          this.accounts = [];
          this.resetActiveListIndexForCurrentAccounts();
          return;
        }
        this.pagination = response.pagination;
        this.accounts = response.pagination.data ? response.pagination.data : [];
        this.resetActiveListIndexForCurrentAccounts();
      }.bind(this),
      function () {
        this.listLoading = false;
      }.bind(this)
    );
  }

  previousPage(): void {
    if (this.pagination.current_page <= 1) {
      return;
    }
    this.loadAccountsPage(this.pagination.current_page - 1);
  }

  nextPage(): void {
    if (!this.hasNextPage) {
      return;
    }
    this.loadAccountsPage(this.pagination.current_page + 1);
  }

  get hasNextPage(): boolean {
    return this.pagination.current_page < this.pagination.last_page;
  }

  private clearSearchDebounceTimer(): void {
    if (this.searchDebounceTimer !== null) {
      window.clearTimeout(this.searchDebounceTimer);
      this.searchDebounceTimer = null;
    }
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

        this.selectedAccountChange.emit(result.account);
        this.loadAccountsPage(1);
      }.bind(this)
    );
  }

  editAccount(account: BankAccount): void {
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
        if (this.selectedAccount && this.selectedAccount.id === editedAccount.id) {
          this.selectedAccountChange.emit(editedAccount);
        }
        this.loadAccountsPage(this.pagination.current_page ? this.pagination.current_page : 1);
      }.bind(this)
    );
  }

  deleteAccount(account: BankAccount): void {
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

        this.bankAccountService
          .delete(account.id)
          .subscribe(
            () => {
              this.accounts = this.accounts.filter((current) => current.id !== account.id);
              if (this.selectedAccount && this.selectedAccount.id === account.id) {
                this.selectedAccountChange.emit(this.accounts.length > 0 ? this.accounts[0] : null);
              }
              this.loadAccountsPage(this.pagination.current_page ? this.pagination.current_page : 1);
            },
            () => {
            }
          )
          ;
      }.bind(this)
    );
  }

  selectAccount(account: BankAccount): void {
    this.selectedAccountChange.emit(account);
    this.closePanel();
  }

  trackByAccountId(index: number, account: BankAccount): number {
    return account.id;
  }

  isSelected(account: BankAccount): boolean {
    if (!this.selectedAccount) {
      return false;
    }

    return this.selectedAccount.id === account.id;
  }

  resolveBankName(code: string): string {
    const bankData = banks.get(code as any);

    if (!bankData) {
      return "Banco";
    }

    return bankData.name;
  }

  private shouldIgnoreListKeyboardShortcuts(event: KeyboardEvent): boolean {
    const target = event.target as HTMLElement;
    if (!target) {
      return false;
    }

    if (target.closest && target.closest(".swal2-container")) {
      return true;
    }

    const tag = target.tagName ? target.tagName.toLowerCase() : "";
    const key = event.key;
    const isArrowNavKey = key === "ArrowDown" || key === "ArrowUp";
    const isEnterSelectKey = key === "Enter";
    const inOurPanel = target.closest && target.closest(".bank-accounts__panel");

    // Busca com autofocus: setas navegam e Enter confirma a linha destacada.
    if ((isArrowNavKey || isEnterSelectKey) && inOurPanel && tag === "input") {
      return false;
    }

    if (tag === "input" || tag === "textarea" || tag === "select" || target.isContentEditable) {
      return true;
    }

    if (target.closest && target.closest(".bank-accounts__item__actions")) {
      return true;
    }

    if (target.closest && target.closest(".bank-accounts__pagination")) {
      return true;
    }

    if (target.closest && target.closest(".bank-accounts__panel__header")) {
      return true;
    }

    if (target.closest && target.closest(".bank-accounts__new-button")) {
      return true;
    }

    return false;
  }

  private resetActiveListIndexForCurrentAccounts(): void {
    if (!this.accounts.length) {
      this.activeListIndex = -1;
      return;
    }

    if (this.selectedAccount) {
      for (let i = 0; i < this.accounts.length; i++) {
        if (this.accounts[i].id === this.selectedAccount.id) {
          this.activeListIndex = i;
          return;
        }
      }
    }

    this.activeListIndex = 0;
  }

  private setActiveListIndex(index: number): void {
    this.activeListIndex = index;
    this.scrollActiveRowIntoView();
  }

  private scrollActiveRowIntoView(): void {
    const self = this;
    setTimeout(function () {
      const rows = self.accountRowRefs ? self.accountRowRefs.toArray() : [];
      const ref = rows[self.activeListIndex];
      if (ref && ref.nativeElement) {
        ref.nativeElement.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }, 0);
  }
}
