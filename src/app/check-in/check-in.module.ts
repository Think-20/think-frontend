import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatNativeDateModule } from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTooltipModule } from "@angular/material/tooltip";

import { CheckInComponent } from "./check-in.component";
import { CheckInApprovalComponent } from "./components/check-in-approval/check-in-approval.component";
import { CheckInBillingAmountComponent } from "./components/check-in-billing-amount/check-in-billing-amount.component";
import { CheckInBillingComponent } from "./components/check-in-billing/check-in-billing.component";
import { CheckInComissionComponent } from "./components/check-in-comission/check-in-comission.component";
import { CheckInContactInfoComponent } from "./components/check-in-contact-info/check-in-contact-info.component";
import { CheckInObsComponent } from "./components/check-in-obs/check-in-obs.component";
import { CheckInOtherCnpjComponent } from "./components/check-in-other-cnpj/check-in-other-cnpj.component";
import { CheckInOtherCnpjsComponent } from "./components/check-in-other-cnpjs/check-in-other-cnpjs.component";
import { CheckInPaymentFormComponent } from "./components/check-in-payment-form/check-in-payment-form.component";
import { CheckInPaymentComponent } from "./components/check-in-payment/check-in-payment.component";
import { CheckInPeopleComponent } from "./components/check-in-people/check-in-people.component";

@NgModule({
  declarations: [
    CheckInComponent,
    CheckInApprovalComponent,
    CheckInContactInfoComponent,
    CheckInBillingComponent,
    CheckInBillingAmountComponent,
    CheckInObsComponent,
    CheckInComissionComponent,
    CheckInPeopleComponent,
    CheckInPaymentComponent,
    CheckInPaymentFormComponent,
    CheckInOtherCnpjsComponent,
    CheckInOtherCnpjComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatNativeDateModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  exports: [
    CheckInComponent,
    CheckInApprovalComponent,
    CheckInContactInfoComponent,
    CheckInBillingComponent,
    CheckInBillingAmountComponent,
    CheckInObsComponent,
    CheckInComissionComponent,
    CheckInPeopleComponent,
    CheckInPaymentComponent,
    CheckInPaymentFormComponent,
    CheckInOtherCnpjsComponent,
    CheckInOtherCnpjComponent,
  ],
})
export class CheckInModule {}
