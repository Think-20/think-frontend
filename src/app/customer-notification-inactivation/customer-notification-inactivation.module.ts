import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { HttpModule } from "@angular/http";
import { ReactiveFormsModule } from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatInputModule } from "@angular/material/input";

import { CustomeNotificationInactivationComponente } from "./customer-notification-inactivation.component";
import { CustomeNotificationInactivationService } from "./customer-notification-inactivation.service";
import { CustomerNotificationInactivationRoutingModule } from "./customer-notification-inactivation-routing.module";

@NgModule({
  declarations: [CustomeNotificationInactivationComponente],
  imports: [
    CommonModule,
    HttpModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    CustomerNotificationInactivationRoutingModule,
  ],
  providers: [CustomeNotificationInactivationService],
})
export class CustomerNotificationInactivationModule {}
