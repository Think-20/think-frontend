import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { MaskDirective } from "./mask.directive";
import { UcWordsDirective } from "./uc-words.directive";

@NgModule({
  declarations: [MaskDirective, UcWordsDirective],
  imports: [CommonModule],
  exports: [MaskDirective, UcWordsDirective],
})
export class FormDirectivesModule {}
