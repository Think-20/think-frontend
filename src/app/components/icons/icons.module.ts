import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { IconCheckComponent } from "./icon-check/icon-check.component";
import { IconCheckedCircleComponent } from "./icon-checked-circle/icon-checked-circle.component";
import { IconCreditCardComponent } from "./icon-credit-card/icon-credit-card.component";
import { IconExternalLinkComponent } from "./icon-external-link/icon-external-link.component";
import { IconEyeClosedComponent } from "./icon-eye-closed/icon-eye-closed.component";
import { IconEyeComponent } from "./icon-eye/icon-eye.component";
import { IconFileComponent } from "./icon-file/icon-file.component";
import { IconFilterComponent } from "./icon-filter/icon-filter.component";
import { IconLucideBuildingComponent } from "./icon-lucide-building/icon-lucide-building.component";
import { IconLucideRepeatComponent } from "./icon-lucide-repeat/icon-lucide-repeat.component";
import { IconMenuComponent } from "./icon-menu/icon-menu.component";
import { IconNegativeComponent } from "./icon-negative/icon-negative.component";
import { IconNegativeGraphComponent } from "./icon-negative-graph/icon-negative-graph.component";
import { IconPaperclipComponent } from "./icon-paperclip/icon-paperclip.component";
import { IconPositiveGraphComponent } from "./icon-positive-graph/icon-positive-graph.component";
import { IconTagComponent } from "./icon-tag/icon-tag.component";
import { IconUploadComponent } from "./icon-upload/icon-upload.component";

@NgModule({
  declarations: [
    IconCheckComponent,
    IconCheckedCircleComponent,
    IconCreditCardComponent,
    IconExternalLinkComponent,
    IconEyeComponent,
    IconEyeClosedComponent,
    IconFileComponent,
    IconFilterComponent,
    IconLucideBuildingComponent,
    IconLucideRepeatComponent,
    IconMenuComponent,
    IconNegativeComponent,
    IconNegativeGraphComponent,
    IconPaperclipComponent,
    IconPositiveGraphComponent,
    IconTagComponent,
    IconUploadComponent
  ],
  imports: [CommonModule],
  exports: [
    IconCheckComponent,
    IconCheckedCircleComponent,
    IconCreditCardComponent,
    IconExternalLinkComponent,
    IconEyeComponent,
    IconEyeClosedComponent,
    IconFileComponent,
    IconFilterComponent,
    IconLucideBuildingComponent,
    IconLucideRepeatComponent,
    IconMenuComponent,
    IconNegativeComponent,
    IconNegativeGraphComponent,
    IconPaperclipComponent,
    IconPositiveGraphComponent,
    IconTagComponent,
    IconUploadComponent
  ]
})
export class IconsModule {}
