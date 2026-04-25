import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressBarModule } from "@angular/material/progress-bar";

import { GamificationControlsModule } from "../shared/gamification-controls.module";
import { GamificationComponent } from "./gamification.component";
import { GamificationRoutingModule } from "./gamification-routing.module";

@NgModule({
  declarations: [GamificationComponent],
  imports: [CommonModule, FormsModule, MatIconModule, MatProgressBarModule, GamificationControlsModule, GamificationRoutingModule],
})
export class GamificationModule {}
