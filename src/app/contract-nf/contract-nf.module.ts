import { CommonModule, DatePipe } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";

import { FileUploadSharedModule } from "../shared/file-upload/file-upload-shared.module";
import { ContractNfComponent } from "./contract-nf.component";

@NgModule({
  declarations: [ContractNfComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatTooltipModule,
    FileUploadSharedModule,
  ],
  exports: [ContractNfComponent],
  providers: [DatePipe],
})
export class ContractNfModule {}
