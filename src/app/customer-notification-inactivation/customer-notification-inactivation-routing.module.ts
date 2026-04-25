import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { CustomeNotificationInactivationComponente } from "./customer-notification-inactivation.component";

const routes: Routes = [
  {
    path: "",
    component: CustomeNotificationInactivationComponente,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomerNotificationInactivationRoutingModule {}
