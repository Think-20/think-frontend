import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { FinancialTransactionTag } from "app/shared/models/financial-transaction.model";

@Component({
  selector: "cb-financial-tags",
  templateUrl: "./financial-tags.component.html",
  styleUrls: ["./financial-tags.component.scss"],
})
export class FinancialTagsComponent implements OnChanges {
  @Input() tags: FinancialTransactionTag[] = [];

  /** Incrementado pelo pai ao aplicar transação no formulário (fecha o campo inline). */
  @Input() tagSectionKey = 0;

  @Output() tagsChange = new EventEmitter<FinancialTransactionTag[]>();

  readonly novaTagPlaceholder = "Nova tag";

  novaTagCtrl = new FormControl("");

  tagInputOpen = false;

  @ViewChild("novaTagInput", { static: false })
  private novaTagInput: ElementRef;

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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tagSectionKey && !changes.tagSectionKey.firstChange) {
      this.closeTagInput();
    }
  }

  openTagInput(): void {
    this.tagInputOpen = true;
    const self = this;
    setTimeout(function () {
      const host = self.novaTagInput && self.novaTagInput.nativeElement;
      if (host && host.focus) {
        host.focus();
      }
    }, 0);
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
    if (!this.addTag()) {
      return;
    }
    const self = this;
    setTimeout(function () {
      const host = self.novaTagInput && self.novaTagInput.nativeElement;
      if (host && host.focus) {
        host.focus();
      }
    }, 0);
  }

  /** @returns true se uma nova tag foi incluída na lista. */
  addTag(): boolean {
    const raw = this.novaTagCtrl.value ? String(this.novaTagCtrl.value) : "";
    const trimmed = raw.replace(/^\s+|\s+$/g, "");
    if (!trimmed.length) {
      return false;
    }
    const lower = trimmed.toLowerCase();
    const base = this.tags ? this.tags : [];
    for (let i = 0; i < base.length; i++) {
      if (base[i].descricao.toLowerCase() === lower) {
        return false;
      }
    }
    const next = this.cloneTagList(base);
    next.push({ idtag: 0, descricao: trimmed });
    this.tagsChange.emit(next);
    this.novaTagCtrl.setValue("");
    return true;
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
}
