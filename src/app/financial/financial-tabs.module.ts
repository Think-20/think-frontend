import { CommonModule } from "@angular/common";
import { NO_ERRORS_SCHEMA, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatNativeDateModule } from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTooltipModule } from "@angular/material/tooltip";
import { CurrencyMaskModule } from "ng2-currency-mask";

import { CategoryTagComponent } from "../components/category-tag/category-tag.component";
import { CurrencyValueComponent } from "../components/currency-value/currency-value.component";
import { ValueVisibilityControlComponent } from "../components/value-visibility-control/value-visibility-control.component";
import { FormComponent } from "../components/dumbs/form/form.component";
import { FormCategoryColorComponent } from "../components/dumbs/form-category-color/form-category-color.component";
import { FormFieldComponent } from "../components/dumbs/form-field/form-field.component";
import { InputNumberComponent } from "../components/dumbs/input-number/input-number.component";
import { InputPriceComponent } from "../components/dumbs/input-price/input-price.component";
import { InputTextComponent } from "../components/dumbs/input-text/input-text.component";
import { LabelComponent } from "../components/dumbs/label/label.component";
import { BankImageComponent } from "../components/dumbs/bank-image/bank-image.component";
import { FinancialDateFilterComponent } from "../components/dumbs/financial-date-filter/financial-date-filter.component";
import { FinancialPeriodFilterComponent } from "../components/dumbs/financial-period-filter/financial-period-filter.component";
import { FinancialStatusComponent } from "../components/dumbs/financial-status/financial-status.component";
import { IconsModule } from "../components/icons/icons.module";
import { ModalComponent } from "../components/modal/modal.component";
import { BankAccountModalComponent } from "../components/smart/bank-account-modal/bank-account-modal.component";
import { BankAccountsComponent } from "../components/smart/bank-accounts/bank-accounts.component";
import { CategoryModalComponent } from "../components/smart/category-modal/category-modal.component";
import { JobsListSharedModule } from "../job-list/jobs-list-shared.module";
import { FinancialDetailsComponent } from "../components/smart/financial-details/financial-details.component";
import { FinancialFilterComponent } from "../components/smart/financial-filter/financial-filter.component";
import { FinancialFormComponent } from "../components/smart/financial-form/financial-form.component";
import { FinancialInstallmentsComponent } from "../components/smart/financial-installments/financial-installments.component";
import { FinancialTagsComponent } from "../components/smart/financial-tags/financial-tags.component";
import { FinancialCreateComponent } from "../components/smart/financial-create/financial-create.component";
import { FinancialRevenuesModalComponent } from "../components/smart/financial-revenues-modal/financial-revenues-modal.component";
import { FinancialHomeComponent } from "../financial-home/financial-home.component";
import { FinancialSummaryModalComponent } from "../financial-summary-modal/financial-summary-modal.component";
import { FinancialTransactionComponent } from "../financial-transaction/financial-transaction.component";
import { GamificationControlsModule } from "../shared/gamification-controls.module";
import { DecimalPipe } from "../shared/decimal.pipe";
import { FormDirectivesModule } from "../shared/form-directives.module";
import { FinancialComponent } from "./financial.component";

@NgModule({
  declarations: [
    CurrencyValueComponent,
    ValueVisibilityControlComponent,
    CategoryTagComponent,
    FinancialDateFilterComponent,
    FinancialPeriodFilterComponent,
    BankImageComponent,
    FinancialStatusComponent,
    FinancialDetailsComponent,
    FinancialFormComponent,
    FinancialFilterComponent,
    FinancialTagsComponent,
    FinancialInstallmentsComponent,
    ModalComponent,
    FormFieldComponent,
    LabelComponent,
    FormComponent,
    FormCategoryColorComponent,
    InputTextComponent,
    InputNumberComponent,
    InputPriceComponent,
    BankAccountsComponent,
    BankAccountModalComponent,
    CategoryModalComponent,
    FinancialComponent,
    FinancialHomeComponent,
    FinancialTransactionComponent,
    FinancialCreateComponent,
    FinancialRevenuesModalComponent,
    FinancialSummaryModalComponent,
    DecimalPipe,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CurrencyMaskModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatNativeDateModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatTooltipModule,
    IconsModule,
    FormDirectivesModule,
    GamificationControlsModule,
    JobsListSharedModule,
  ],
  exports: [
    FinancialComponent,
    CurrencyValueComponent,
    ValueVisibilityControlComponent,
    CategoryTagComponent,
    FinancialDateFilterComponent,
    FinancialPeriodFilterComponent,
    BankImageComponent,
    FinancialStatusComponent,
    FinancialDetailsComponent,
    FinancialFormComponent,
    FinancialFilterComponent,
    FinancialTagsComponent,
    FinancialInstallmentsComponent,
    ModalComponent,
    FormFieldComponent,
    LabelComponent,
    FormComponent,
    FormCategoryColorComponent,
    InputTextComponent,
    InputNumberComponent,
    InputPriceComponent,
    BankAccountsComponent,
    BankAccountModalComponent,
    CategoryModalComponent,
    FinancialCreateComponent,
    FinancialRevenuesModalComponent,
    FinancialSummaryModalComponent,
    DecimalPipe,
  ],
  entryComponents: [
    FinancialCreateComponent,
    FinancialRevenuesModalComponent,
    FinancialSummaryModalComponent,
    BankAccountModalComponent,
    CategoryModalComponent,
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class FinancialTabsModule {}
