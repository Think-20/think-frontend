import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AuthGuard } from "../login/auth.guard";
import { JobTabsComponent } from "./job-tabs/job-tabs.component";
import { JobsComponent } from "./jobs.component";

const routes: Routes = [
  {
    path: "",
    component: JobsComponent,
    children: [
      {
        path: "",
        redirectTo: "list",
        pathMatch: "full",
      },
      {
        path: "new",
        component: JobTabsComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "new/:available_date",
        component: JobTabsComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "edit/:id",
        component: JobTabsComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "show/:id",
        component: JobTabsComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "list-old",
        loadChildren: "app/jobs/job-list/job-list-legacy.module#JobListLegacyModule",
        canActivate: [AuthGuard],
      },
      {
        path: "list",
        loadChildren: "app/job-list/jobs-list.module#JobsListModule",
        canActivate: [AuthGuard],
      },
      {
        path: "kanban",
        loadChildren: "app/jobs/jobs-kanban/jobs-kanban.module#JobsKanbanModule",
        canActivate: [AuthGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class JobsRoutingModule {}
