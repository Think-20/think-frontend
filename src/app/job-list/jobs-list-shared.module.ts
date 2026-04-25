import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatNativeDateModule } from "@angular/material/core";
import { MatSelectModule } from "@angular/material/select";
import { MatTooltipModule } from "@angular/material/tooltip";

import { IconButtonComponent } from "../components/icon-button/icon-button.component";
import { SearchComponent } from "../components/search/search.component";
import { IconAddComponent } from "../components/icons/icon-add/icon-add.component";
import { IconArrowDownComponent } from "../components/icons/icon-arrow-down/icon-arrow-down.component";
import { IconArrowLeftComponent } from "../components/icons/icon-arrow-left/icon-arrow-left.component";
import { IconArrowRightComponent } from "../components/icons/icon-arrow-right/icon-arrow-right.component";
import { IconBagComponent } from "../components/icons/icon-bag/icon-bag.component";
import { IconCalendarComponent } from "../components/icons/icon-calendar/icon-calendar.component";
import { IconCheckCircleComponent } from "../components/icons/icon-check-circle/icon-check-circle.component";
import { IconCloseCircleComponent } from "../components/icons/icon-close-circle/icon-close-circle.component";
import { IconCloseComponent } from "../components/icons/icon-close/icon-close.component";
import { IconKanbanComponent } from "../components/icons/icon-kanban/icon-kanban.component";
import { IconListComponent } from "../components/icons/icon-list/icon-list.component";
import { IconMoreComponent } from "../components/icons/icon-more/icon-more.component";
import { IconSearchComponent } from "../components/icons/icon-search/icon-search.component";
import { IconTimeComponent } from "../components/icons/icon-time/icon-time.component";
import { StarsModule } from "../shared/stars/stars.module";
import { JobHeaderComponent } from "./job-header/job-header.component";
import { JobListComponent } from "./job-list.component";

@NgModule({
  declarations: [
    JobListComponent,
    JobHeaderComponent,
    IconButtonComponent,
    SearchComponent,
    IconAddComponent,
    IconArrowDownComponent,
    IconArrowLeftComponent,
    IconArrowRightComponent,
    IconBagComponent,
    IconCalendarComponent,
    IconCheckCircleComponent,
    IconCloseCircleComponent,
    IconCloseComponent,
    IconKanbanComponent,
    IconListComponent,
    IconMoreComponent,
    IconSearchComponent,
    IconTimeComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatNativeDateModule,
    MatSelectModule,
    MatTooltipModule,
    StarsModule,
  ],
  exports: [
    JobListComponent,
    JobHeaderComponent,
    IconButtonComponent,
    SearchComponent,
    IconAddComponent,
    IconArrowDownComponent,
    IconArrowLeftComponent,
    IconArrowRightComponent,
    IconBagComponent,
    IconCalendarComponent,
    IconCheckCircleComponent,
    IconCloseCircleComponent,
    IconCloseComponent,
    IconKanbanComponent,
    IconListComponent,
    IconMoreComponent,
    IconSearchComponent,
    IconTimeComponent,
  ],
})
export class JobsListSharedModule {}
