import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatExpansionModule } from "@angular/material/expansion";

import { ItemProposalFormComponent } from "./proposal-form/item-proposal-form/item-proposal-form.component";
import { ProposalFormComponent } from "./proposal-form/proposal-form.component";
import { ProposalsComponent } from "./proposals.component";

@NgModule({
  declarations: [ProposalsComponent, ProposalFormComponent, ItemProposalFormComponent],
  imports: [CommonModule, ReactiveFormsModule, MatCheckboxModule, MatExpansionModule],
  exports: [ProposalsComponent],
})
export class ProposalsModule {}
