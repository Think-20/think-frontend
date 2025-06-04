import { JobService } from "app/jobs/job.service";
import { Component, Input } from "@angular/core";
import { Job } from "app/jobs/job.model";
import { AuthService } from "app/login/auth.service";

@Component({
  selector: "cb-jobs-kanban-card",
  templateUrl: "./jobs-kanban-card.component.html",
  styleUrls: ["./jobs-kanban-card.component.scss"],
})
export class JobsKanbanCardComponent {
  @Input() job = new Job();

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

  delete(job: Job) {
    this.jobService.delete(job.id).subscribe((data) => {
      if (data.status) {
        // this.jobs.splice(this.jobs.indexOf(job), 1);
      }
    })
  }
}
