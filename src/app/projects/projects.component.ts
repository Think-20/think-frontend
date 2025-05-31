import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Job } from '../jobs/job.model';
import { TaskService } from '../schedule/task.service';
import { Task } from '../schedule/task.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectFileService } from './project-file.service';
import { API } from 'app/app.api';
import { EmployeeService } from 'app/employees/employee.service';
import { AuthService } from 'app/login/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { FileUploadInterface } from 'app/shared/file-upload/file-upload.interface';
import { ProjectFile } from './project-file.model';

@Component({
  selector: 'cb-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  @Input('typeForm') typeForm: string
  @Input() job: Job
  actionText: string
  actionUrl: string
  sortedTasks: Task[]
  @Output() requestJobReloadEmitter: EventEmitter<any> = new EventEmitter<any>();
  isAttendance: boolean = null
  expandedIndex: number = null

  @Output("changed") changed = new EventEmitter<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snack: MatSnackBar,
    private datePipe: DatePipe,
    private authService: AuthService,
    private taskService: TaskService,
    private employeeService: EmployeeService,
    private projectFileService: ProjectFileService
  ) { }

  ngOnInit() {
    this.sortTasks()
    this.loadTaskFromRoute()

    let snack = this.snack.open('Carregando botões...')
    this.employeeService.canInsertClients().subscribe(employees => {
      snack.dismiss()
      this.isAttendance = false

      employees.forEach(element => {
        if(element.id === this.authService.currentUser().employee_id)
        {
          this.isAttendance = true
        }
      });
    })
  }

  uploadDone(task: Task) {
    let newTask = this.sortedTasks.find(t => t.id == task.id);

    newTask.project_files[newTask.project_files.length - 1].responsible = this.authService.currentUser().employee

    this.sortedTasks[this.sortedTasks.findIndex(t => t.id == newTask.id)] = newTask
  }

  onChanged(task: Task, files: FileUploadInterface[]): void {
    task.project_files = files as ProjectFile[];
    
    this.changed.emit();
  }

  ngOnChanges() {
    this.sortTasks()
    this.loadTaskFromRoute()
    this.expandedIndex = this.expandedIndex == null ? 0 : this.expandedIndex
  }

  getText() {
    return this.isAttendance ? 'PRÓXIMO' : 'IR PARA AGENDA'
  }

  getRoute(task: Task) {
    if(this.isAttendance) {
      this.requestJobReloadEmitter.emit()
    }

    return this.isAttendance ? `/jobs/edit/${this.job.id}?tab=specification`
      : '/schedule?date=' + this.datePipe.transform(task.items[0].date, 'yyyy-MM-dd')
  }

  navigateTo(url) {
    return this.router.navigateByUrl(url)
  }

  showButtonSpecification(task: Task) {
    if(task.project_files.length == 0)
      return false

    let projectTask = this.job.tasks.filter((t) => {
      return t.task_id == task.id && t.project_files.length > 0
    })

    if(projectTask.length > 0) {
      return false
    }

    return true
  }

  loadTaskFromRoute() {
    this.route.queryParams.subscribe((params) => {
      let taskId = params['taskId']
      this.sortedTasks.forEach((task, index) => {
        if(task.id == taskId) {
          this.expandedIndex = index
        }
      })
    })
  }

  sortTasks() {
    this.sortedTasks = this.job.tasks.filter((task) => {
      return task.job_activity.initial == 1
    }) || [];

    this.sortedTasks = this.sortedTasks.sort((a, b) => a.reopened - b.reopened).reverse();

    this.sortedTasks.forEach((task, index) => {
      if(task.project_files.length > 0 && this.expandedIndex == null) {
        this.expandedIndex = index
      }
    })
  }

  downloadAll(task: Task) {
    let url = this.projectFileService.downloadAllUrl(task)
    window.open(`${API}/${url}`, '_blank')
  }

}
