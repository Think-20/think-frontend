import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: "cb-select",
  templateUrl: "./select.component.html",
  styleUrls: ["./select.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: SelectComponent,
      multi: true,
    },
  ],
})
export class SelectComponent<T> implements ControlValueAccessor {
  @Input() options: T[] = [];

  @Input() labelField: string = "name";
  @Input() placeholder: string = "Selecione";
  @Input() showFilter = true;
  @Input() actionButtonLabel = "";
  @Input() closeOnAction = true;

  @Input() hasError = false;
  @Output() actionButtonClick = new EventEmitter<void>();

  value: T | null = null;
  isOpen = false;
  searchTerm = "";
  isDisabled = false;
  openUpwards = false;
  highlightedIndex = -1;
  dropdownStyles: { [key: string]: string } = {};

  @ViewChild("trigger", { static: false }) trigger?: ElementRef<HTMLButtonElement>;
  @ViewChild("searchInput", { static: false }) searchInput?: ElementRef<HTMLInputElement>;

  onChange = (value: T) => {};
  onTouched = () => {};

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  writeValue(value: T | null): void {
    this.value = value;
  }

  registerOnChange(fn: (value: T) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  toggleOpen(): void {
    if (this.isDisabled) {
      return;
    }

    this.isOpen = !this.isOpen;
    this.onTouched();

    if (this.isOpen) {
      setTimeout(() => {
        this.updateDropdownPosition();
        this.syncHighlightedWithValue();

        if (this.showFilter && this.searchInput) {
          this.searchInput.nativeElement.focus();
        }
      });
    } else {
      this.searchTerm = "";
    }
  }

  closeDropdown(): void {
    this.isOpen = false;
    this.searchTerm = "";
    this.highlightedIndex = -1;
    this.dropdownStyles = {};
  }

  selectValue(value: T): void {
    this.value = value;
    this.onChange(value);
    this.onTouched();
    this.closeDropdown();
  }

  get filteredOptions(): T[] {
    if (!this.showFilter) {
      return this.options;
    }

    const term = this.searchTerm.trim().toLowerCase();

    if (!term) {
      return this.options;
    }

    return this.options.filter((option) =>
      this.getOptionLabel(option).toLowerCase().includes(term)
    );
  }

  get selectedLabel(): string {
    if (!this.value) {
      return this.placeholder;
    }

    return this.getOptionLabel(this.value);
  }

  get isEmpty(): boolean {
    return !this.value;
  }

  getOptionLabel(option: T): string {
    const optionMap = option as Record<string, unknown>;
    const value = optionMap ? optionMap[this.labelField] : "";
    return typeof value === "string" ? value : String(value || "");
  }

  isSelected(option: T): boolean {
    return this.value === option;
  }

  isHighlighted(index: number): boolean {
    return this.highlightedIndex === index;
  }

  onSearchTermChange(): void {
    this.highlightedIndex = this.filteredOptions.length > 0 ? 0 : -1;
  }

  handleTriggerKeydown(event: KeyboardEvent): void {
    if (this.isDisabled) {
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();

      if (!this.isOpen) {
        this.toggleOpen();
        return;
      }

      this.moveHighlightedOption(event.key === "ArrowDown" ? 1 : -1);
      return;
    }

    if (this.isOpen && event.key === "Enter") {
      if (this.highlightedIndex >= 0 && this.highlightedIndex < this.filteredOptions.length) {
        event.preventDefault();
        this.selectValue(this.filteredOptions[this.highlightedIndex]);
      }
      return;
    }

    if (this.isOpen && event.key === "Escape") {
      event.preventDefault();
      this.closeDropdown();
    }
  }

  handleSearchKeydown(event: KeyboardEvent): void {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      this.moveHighlightedOption(1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      this.moveHighlightedOption(-1);
      return;
    }

    if (event.key === "Enter") {
      if (this.highlightedIndex >= 0 && this.highlightedIndex < this.filteredOptions.length) {
        event.preventDefault();
        this.selectValue(this.filteredOptions[this.highlightedIndex]);
      }
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      this.closeDropdown();

      if (this.trigger) {
        this.trigger.nativeElement.focus();
      }
    }
  }

  onActionButtonClick(): void {
    this.actionButtonClick.emit();

    if (this.closeOnAction) {
      this.closeDropdown();
    }
  }

  @HostListener("document:click", ["$event"])
  handleDocumentClick(event: MouseEvent): void {
    if (!this.isOpen) {
      return;
    }

    const target = event.target as Node | null;
    if (target && !this.elementRef.nativeElement.contains(target)) {
      this.closeDropdown();
      this.onTouched();
    }
  }

  @HostListener("focusout", ["$event"])
  handleFocusOut(event: FocusEvent): void {
    const nextFocused = event.relatedTarget as Node | null;
    if (nextFocused && this.elementRef.nativeElement.contains(nextFocused)) {
      return;
    }
    this.onTouched();
    if (this.isOpen) {
      this.closeDropdown();
    }
  }

  @HostListener("window:resize")
  handleWindowResize(): void {
    if (this.isOpen) {
      this.updateDropdownPosition();
    }
  }

  @HostListener("window:scroll")
  handleWindowScroll(): void {
    if (this.isOpen) {
      this.updateDropdownPosition();
    }
  }

  private moveHighlightedOption(step: number): void {
    const options = this.filteredOptions;
    const total = options.length;

    if (total === 0) {
      this.highlightedIndex = -1;
      return;
    }

    if (this.highlightedIndex < 0) {
      this.highlightedIndex = step > 0 ? 0 : total - 1;
    } else {
      const nextIndex = this.highlightedIndex + step;

      if (nextIndex < 0) {
        this.highlightedIndex = total - 1;
      } else if (nextIndex >= total) {
        this.highlightedIndex = 0;
      } else {
        this.highlightedIndex = nextIndex;
      }
    }

    this.ensureHighlightedOptionVisible();
  }

  private syncHighlightedWithValue(): void {
    const options = this.filteredOptions;

    if (options.length === 0) {
      this.highlightedIndex = -1;
      return;
    }

    if (!this.value) {
      this.highlightedIndex = 0;
      return;
    }

    let selectedIndex = -1;
    for (let i = 0; i < options.length; i++) {
      if (options[i] === this.value) {
        selectedIndex = i;
        break;
      }
    }

    this.highlightedIndex = selectedIndex >= 0 ? selectedIndex : 0;
    this.ensureHighlightedOptionVisible();
  }

  private ensureHighlightedOptionVisible(): void {
    if (this.highlightedIndex < 0) {
      return;
    }

    setTimeout(() => {
      const host = this.elementRef.nativeElement;
      const optionElements = host.querySelectorAll(".select__option");

      if (!optionElements || this.highlightedIndex >= optionElements.length) {
        return;
      }

      const optionElement = optionElements[this.highlightedIndex] as HTMLElement;

      if (optionElement && optionElement.scrollIntoView) {
        optionElement.scrollIntoView({ block: "nearest" });
      }
    });
  }

  private updateDropdownPosition(): void {
    if (!this.trigger) {
      return;
    }

    const rect = this.trigger.nativeElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const margin = 8;

    const spaceBelow = viewportHeight - rect.bottom - margin;
    const spaceAbove = rect.top - margin;
    const preferredHeight = 260;

    this.openUpwards = spaceBelow < preferredHeight && spaceAbove > spaceBelow;

    const maxHeight = Math.max(120, this.openUpwards ? spaceAbove : spaceBelow);
    const spacing = 6;
    const left = Math.max(margin, rect.left);
    const width = Math.min(rect.width, viewportWidth - left - margin);
    const top = rect.bottom + spacing;
    const bottom = viewportHeight - rect.top + spacing;

    if (this.openUpwards) {
      this.dropdownStyles = {
        top: "auto",
        bottom: bottom + "px",
        left: left + "px",
        width: width + "px",
        maxHeight: maxHeight + "px",
      };
      return;
    }

    this.dropdownStyles = {
      top: top + "px",
      bottom: "auto",
      left: left + "px",
      width: width + "px",
      maxHeight: maxHeight + "px",
    };
  }
}
