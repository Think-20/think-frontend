import { JobService } from "app/jobs/job.service";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Job } from "app/jobs/job.model";
import { AuthService } from "app/login/auth.service";
import { EProductionStatus, productionStatusLabels } from "app/shared/enums/production-status.enum";
import {
  creationStatusLabels,
  ECreationStatus,
} from "app/shared/enums/creation-status.enum";
import { EJobStatus } from "app/shared/enums/job-status.enum";

@Component({
  selector: "cb-workflow-card",
  templateUrl: "./workflow-card.component.html",
  styleUrls: ["./workflow-card.component.scss"],
})
export class WorkflowCardComponent {
  @Input() job = new Job();

  @Input() showCreationStatus = false;
  @Input() showProductionStatus = false;

  @Output() deleteJob = new EventEmitter<void>();

  get type(): string {
    if (this.job && this.job.job_type && this.job.job_type.description) {
      return this.job.job_type.description;
    }

    return "-";
  }

  get client(): string {
    if (this.job && this.job.agency && this.job.not_client) {
      return this.job.not_client;
    }

    return this.job.client ? this.job.client.fantasy_name : this.job.not_client;
  }

  get hasCreationStatus(): boolean {
    return this.job && !!this.job.creation_status;
  }
  
  get creationStatus(): string {
    return creationStatusLabels.get(this.job.creation_status);
  }

  get hasProductionStatus(): boolean {
    return this.job && !!this.job.production_status;
  }

  get productionStatus(): string {
    return productionStatusLabels.get(this.job.production_status);
  }

  constructor(
    readonly jobService: JobService,
    private authService: AuthService
  ) {}

  permissionVerify(module: string, job: Job): boolean {
    let access: boolean;

    let employee = this.authService.currentUser().employee;

    switch (module) {
      case "new": {
        access = this.authService.hasAccess("job/save");
        break;
      }
      case "show": {
        access =
          job.attendance.id != employee.id
            ? this.authService.hasAccess("jobs/get/{id}")
            : true;

        break;
      }
      case "edit": {
        access =
          job.attendance.id != employee.id
            ? this.authService.hasAccess("job/edit")
            : true;
        break;
      }
      case "delete": {
        access =
          job.attendance.id != employee.id
            ? this.authService.hasAccess("job/remove/{id}")
            : true;
        break;
      }
      default: {
        access = false;
        break;
      }
    }

    return access;
  }

  delete(): void {
    this.deleteJob.emit();
  }
}
