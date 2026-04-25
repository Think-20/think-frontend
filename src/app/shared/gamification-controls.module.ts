import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { ButtonComponent } from "../components/button/button.component";
import { InputDatetimeComponent } from "../components/dumbs/input-datetime/input-datetime.component";
import { SelectComponent } from "../components/dumbs/select/select.component";
import { IconDownloadComponent } from "../components/icons/icon-download/icon-download.component";
import { IconPrintComponent } from "../components/icons/icon-print/icon-print.component";

@NgModule({
  declarations: [ButtonComponent, IconDownloadComponent, IconPrintComponent, SelectComponent, InputDatetimeComponent],
  imports: [CommonModule, FormsModule],
  exports: [ButtonComponent, IconDownloadComponent, IconPrintComponent, SelectComponent, InputDatetimeComponent],
})
export class GamificationControlsModule {}
