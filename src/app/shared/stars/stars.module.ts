import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";

import { StarsComponent } from "./stars.component";

@NgModule({
  declarations: [StarsComponent],
  imports: [CommonModule, MatIconModule],
  exports: [StarsComponent],
  entryComponents: [StarsComponent],
})
export class StarsModule {}
