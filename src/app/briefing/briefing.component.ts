import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { API } from 'app/app.api';
import { EmployeeService } from 'app/employees/employee.service';
import { Job } from 'app/jobs/job.model';
import { AuthService } from 'app/login/auth.service';
import { Task } from 'app/schedule/task.model';
import { TaskService } from 'app/schedule/task.service';
import { BriefingService } from './briefing.service';
import { FileUploadInterface } from 'app/shared/file-upload/file-upload.interface';
import { BriefingFile } from './briefing-file.model';

@Component({
  selector: "cb-briefing",
  templateUrl: "./briefing.component.html",
  styleUrls: ["./briefing.component.scss"],
})
export class BriefingComponent implements OnInit {
  @Input("typeForm") typeForm: string;
  @Input() job: Job;
  actionText: string;
  actionUrl: string;
  sortedTasks: Task[];
  @Output() requestJobReloadEmitter = new EventEmitter<any>();
  isAttendance: boolean = null;
  expandedIndex: number = null;

  constructor(
    private router: Router,
    private snack: MatSnackBar,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private authService: AuthService,
    readonly taskService: TaskService,
    private employeeService: EmployeeService,
    readonly briefingService: BriefingService,
  ) {}

  ngOnInit() {
    this.sortTasks();
    this.loadTaskFromRoute();

    let snack = this.snack.open("Carregando botões...");
    this.employeeService.canInsertClients().subscribe((employees) => {
      snack.dismiss();
      this.isAttendance = false;

      employees.forEach((element) => {
        if (element.id === this.authService.currentUser().employee_id) {
          this.isAttendance = true;
        }
      });
    });
  }

  uploadDone(task: Task) {
    let newTask = this.sortedTasks.find((t) => t.id == task.id);

    newTask.briefing_files[newTask.briefing_files.length - 1].responsible = this.authService.currentUser().employee;

    this.sortedTasks[this.sortedTasks.findIndex((t) => t.id == newTask.id)] = newTask;
  }

  ngOnChanges() {
    this.sortTasks();
    
    this.loadTaskFromRoute();

    this.expandedIndex = this.expandedIndex == null ? 0 : this.expandedIndex;
  }

  getText() {
    return this.isAttendance ? "PRÓXIMO" : "IR PARA AGENDA";
  }

  getRoute(task: Task) {
    if (this.isAttendance) {
      this.requestJobReloadEmitter.emit();
    }

    return this.isAttendance
      ? `/jobs/edit/${this.job.id}?tab=project`
      : "/schedule?date=" +
          this.datePipe.transform(task.items[0].date, "yyyy-MM-dd");
  }

  navigateTo(url) {
    return this.router.navigateByUrl(url);
  }

  showButtonSpecification(task: Task) {
    if (task.briefing_files && task.briefing_files.length == 0) {
      return false;
    }

    let specificationTask = this.job.tasks.filter((t) => {
      return t.task_id == task.id && t.briefing_files.length > 0;
    });

    if (specificationTask.length > 0) {
      return false;
    }

    return true;
  }

  loadTaskFromRoute() {
    this.route.queryParams.subscribe((params) => {
      let taskId = params["taskId"];

      this.sortedTasks.forEach((task, index) => {
        if (task.id == taskId) {
          this.expandedIndex = index;
        }
      });
    });
  }

  sortTasks() {
    this.sortedTasks = this.job && this.job.tasks && this.job.tasks.length ? this.job.tasks.filter((task) => {
      return task.job_activity.initial == 1;
    }) : [];

    let adds = [];
    
    this.sortedTasks.filter((parentTask) => {
      let temp = this.job.tasks.filter((task) => {
        return (
          parentTask.job_activity.modification_id == task.job_activity_id ||
          parentTask.job_activity.option_id == task.job_activity_id
        );
      });

      adds = adds.concat(temp);

      adds = adds.sort((a, b) => a.reopened - b.reopened);
    });

    this.sortedTasks = this.sortedTasks.concat(adds).reverse();

    this.sortedTasks.forEach((task, index) => {
      if (task.briefing_files && task.briefing_files.length > 0 && this.expandedIndex == null) {
        this.expandedIndex = index;
      }
    });
  }

  downloadAll(task: Task) {
    let url = this.briefingService.downloadAllUrl(task);

    window.open(`${API}/${url}`, "_blank");
  }

  onChanged(task: Task, files: FileUploadInterface[]): void {
    task.briefing_files = files as BriefingFile[];
  }
}
