import { DatePipe } from '@angular/common';
import { TimecardService } from './../../timecard.service';
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'app/login/auth.service';
import { IPlannerLog } from 'app/timecard/models/planner-log.model';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'cb-timecard-planner-form',
  templateUrl: './timecard-planner-form.component.html',
  styleUrls: ['./timecard-planner-form.component.css']
})
export class TimecardPlannerFormComponent implements OnInit, AfterViewInit {

  @Input() date: Date;
  @Input() log: IPlannerLog;

  @Output() changeLog = new EventEmitter<IPlannerLog>();

  isDiretoria = false;

  categories = [
    "Prospecção",
    "Reunião clientes",
    "Prospecção de clientes",
    "Memorial descritivo",
    "Briefing Criação",
    "Processos Adm",
    "Trânsito",
    "Montagem",
    "VT",
    "Feira",
    "Almoço",
    "Intervalo",
    "Saída",
  ];

  form = new FormGroup({
    category: new FormControl(null, []),
    description: new FormControl(null, []),
  });

  constructor(
    private datePipe: DatePipe,
    private authService: AuthService,
    private timecardService: TimecardService,
  ) { }

  ngOnInit() {
    const currentUser = this.authService.currentUser();

    this.isDiretoria = currentUser.employee.department_id === 1;
  }

  ngAfterViewInit(): void {
    this.form.valueChanges
      .debounceTime(1000)
      .pipe(distinctUntilChanged())
      .subscribe(() => {
        this.save();
      });
  }

  save = () => {
    if (this.isDiretoria || this.form.invalid) {
      return;
    }

    const log: IPlannerLog = {
      date: this.datePipe.transform(this.date, 'yyyy-MM-dd HH:mm'),
      category: this.form.value.category,
      description: this.form.value.description,
    };

    if (this.log.id) {
      log.id = this.log.id;
    }

    (this.log.id
      ? this.timecardService.putLog(log)
      : this.timecardService.postLog(log))
      .subscribe({
        next: response => {
          this.log = { ...response.object };

          this.changeLog.emit(this.log);
        }
      });
  }

}