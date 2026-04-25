import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatCardModule } from "@angular/material/card";

import { AlertsContainerComponent } from "./components/alerts-container/alerts-container.component";
import { AlertsRoutingModule } from "./alerts-routing.module";

@NgModule({
  declarations: [AlertsContainerComponent],
  imports: [CommonModule, MatCardModule, AlertsRoutingModule],
})
export class AlertsModule {}
