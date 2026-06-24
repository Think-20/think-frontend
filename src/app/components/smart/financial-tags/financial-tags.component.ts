import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { FinancialService } from "app/financial/financial.service";
import { FinancialTransactionTag } from "app/shared/models/financial-transaction.model";
import { Subscription } from "rxjs";

@Component({
  selector: "cb-financial-tags",
  templateUrl: "./financial-tags.component.html",
  styleUrls: ["./financial-tags.component.scss"],
})
export class FinancialTagsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() tags: FinancialTransactionTag[] = [];

  /** Incrementado pelo pai ao aplicar transação no formulário (fecha o campo inline). */
  @Input() tagSectionKey = 0;

  @Output() tagsChange = new EventEmitter<FinancialTransactionTag[]>();

  readonly novaTagPlaceholder = "Nova tag";

  novaTagCtrl = new FormControl("");

  tagInputOpen = false;

  loadingCatalog = false;

  savingTag = false;

  /** Catálogo de tags disponíveis (tags/all). */
  catalogTags: FinancialTransactionTag[] = [];

  @ViewChild("novaTagInput", { static: false })
  private novaTagInput: ElementRef;

  private catalogSub: Subscription | undefined;

  constructor(private financialService: FinancialService) {}

  get tagNewSizerMirror(): string {
    const raw =
      this.novaTagCtrl.value !== null && this.novaTagCtrl.value !== undefined
        ? String(this.novaTagCtrl.value)
        : "";
    if (raw.length) {
      return raw + "\u200b";
    }
    return this.novaTagPlaceholder + "\u200b";
  }

  ngOnInit(): void {
    this.loadCatalogTags();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tagSectionKey && !changes.tagSectionKey.firstChange) {
      this.closeTagInput();
    }
    if (changes.tags) {
      this.mergeTagsIntoCatalog(this.tags);
    }
  }

  ngOnDestroy(): void {
    if (this.catalogSub) {
      this.catalogSub.unsubscribe();
    }
  }

  openTagInput(): void {
    this.tagInputOpen = true;
    this.focusTagInput();
  }

  closeTagInput(): void {
    this.tagInputOpen = false;
    this.novaTagCtrl.setValue("");
  }

  onNovaTagBlur(): void {
    const self = this;
    setTimeout(function () {
      self.closeTagInput();
    }, 0);
  }

  onNovaTagEnter(event: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.tryAddTag();
  }

  removeTag(index: number): void {
    const base = this.tags ? this.tags : [];
    if (index < 0 || index >= base.length) {
      return;
    }
    const next = this.cloneTagList(base);
    next.splice(index, 1);
    this.tagsChange.emit(next);
  }

  private loadCatalogTags(): void {
    if (this.catalogSub) {
      this.catalogSub.unsubscribe();
    }
    this.loadingCatalog = true;
    const self = this;
    this.catalogSub = this.financialService.getAllTags().subscribe(
      function (list) {
        self.loadingCatalog = false;
        self.catalogTags = list ? list.slice() : [];
        self.mergeTagsIntoCatalog(self.tags);
      },
      function () {
        self.loadingCatalog = false;
      }
    );
  }

  private tryAddTag(): void {
    if (this.savingTag) {
      return;
    }
    const raw = this.novaTagCtrl.value ? String(this.novaTagCtrl.value) : "";
    const trimmed = raw.replace(/^\s+|\s+$/g, "");
    if (!trimmed.length) {
      return;
    }
    if (this.isTagAlreadySelected(trimmed)) {
      return;
    }

    const existing = this.findCatalogTagByDescription(trimmed);
    if (existing) {
      this.appendSelectedTag(existing);
      this.novaTagCtrl.setValue("");
      this.focusTagInput();
      return;
    }

    const self = this;
    this.savingTag = true;
    this.financialService.saveTag({ idtag: 0, descricao: trimmed }).subscribe(
      function (saved) {
        self.savingTag = false;
        if (saved && saved.descricao) {
          self.catalogTags = self.catalogTags.concat([saved]);
          self.appendSelectedTag(saved);
        }
        self.novaTagCtrl.setValue("");
        self.focusTagInput();
      },
      function () {
        self.savingTag = false;
      }
    );
  }

  private appendSelectedTag(tag: FinancialTransactionTag): void {
    const base = this.tags ? this.tags : [];
    const next = this.cloneTagList(base);
    next.push({ idtag: tag.idtag, descricao: tag.descricao });
    this.tagsChange.emit(next);
  }

  private isTagAlreadySelected(description: string): boolean {
    const lower = description.toLowerCase();
    const base = this.tags ? this.tags : [];
    let i = 0;
    for (i = 0; i < base.length; i++) {
      if (base[i].descricao.toLowerCase() === lower) {
        return true;
      }
    }
    return false;
  }

  private findCatalogTagByDescription(description: string): FinancialTransactionTag | null {
    const lower = description.toLowerCase();
    const base = this.catalogTags ? this.catalogTags : [];
    let i = 0;
    for (i = 0; i < base.length; i++) {
      if (base[i].descricao.toLowerCase() === lower) {
        return base[i];
      }
    }
    return null;
  }

  private mergeTagsIntoCatalog(tags: FinancialTransactionTag[]): void {
    if (!tags || !tags.length) {
      return;
    }
    let i = 0;
    for (i = 0; i < tags.length; i++) {
      const tag = tags[i];
      if (!tag || !tag.descricao) {
        continue;
      }
      if (!this.findCatalogTagByDescription(tag.descricao)) {
        this.catalogTags = this.catalogTags.concat([
          { idtag: tag.idtag, descricao: tag.descricao },
        ]);
      }
    }
  }

  private focusTagInput(): void {
    const self = this;
    setTimeout(function () {
      const host = self.novaTagInput && self.novaTagInput.nativeElement;
      if (host && host.focus) {
        host.focus();
      }
    }, 0);
  }

  private cloneTagList(tags: FinancialTransactionTag[]): FinancialTransactionTag[] {
    const out: FinancialTransactionTag[] = [];
    if (!tags || !tags.length) {
      return out;
    }
    let i = 0;
    for (i = 0; i < tags.length; i++) {
      const tag = tags[i];
      out.push({ idtag: tag.idtag, descricao: tag.descricao });
    }
    return out;
  }
}
