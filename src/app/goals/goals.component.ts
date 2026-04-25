import { Component, OnInit } from '@angular/core';
import { Goal, YearsMonth } from './goals.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GoalsService } from './goals.service';
import { MatSnackBar } from '@angular/material';
import { Observable } from 'rxjs';

@Component({
  selector: 'cb-goals',
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.css']
})
export class GoalsComponent implements OnInit {
  public yearsMonth: YearsMonth[] = [];
  public yearMonth: YearsMonth;
  public year = new Date().getFullYear();
  public goals: Goal[] = [];
  public goalsForm: FormGroup;
  public readonly maxYear = new Date().getFullYear();
  public readonly minYear = 2018;

  constructor(private formBuilder: FormBuilder, private goalService: GoalsService, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.fillMonthYears();
    this.loadGoals();
  }


  loadGoals() {
    let snackBar = this.snackBar.open('Carregando metas...')
    this.goalService.getGoals().subscribe(response => {
      this.goals = response;
      this.updateValuesFormYearsMonth();
      snackBar.dismiss();
    },
    () =>  snackBar.dismiss())
  }

  updateGoal(goal: Goal) {
    this.goalService.updateGoals(goal).subscribe(response => {
      this.snackBar.open(response.message)
      this.dismissSnackBar();
    })
  }

  createGoal(goal: Goal) {
    this.goalService.postGoals(goal).subscribe(response => {
      this.snackBar.open(response.message)
      this.dismissSnackBar();
    })
  }

  dismissSnackBar() {
    Observable.timer(1000).subscribe(() => this.snackBar.dismiss())
  }

  updateValuesFormYearsMonth() {
    this.yearMonth.months.forEach(month => {
      const matchingGoal = this.getGoal(month.year, month.month);

      if (matchingGoal) {
        const { id, value, expected_value } = matchingGoal;
        Object.assign(month, { id, value, expected_value });
      }
    });

    this.createForm();
  }

  getGoal(year: number, month: number): Goal {
    return this.goals.find(goal => goal.year === year && goal.month === month);
  }

  createForm() {
    this.goalsForm = this.formBuilder.group({})

    this.yearMonth.months.forEach(month => {
      const monthId = month.month;
      
      this.goalsForm.addControl(monthId.toString(), this.formBuilder.control(month.value));
      this.goalsForm.addControl(monthId.toString() + 'espected', this.formBuilder.control(month.expected_value));

      const control = this.goalsForm.controls[monthId];
      const control2 = this.goalsForm.controls[monthId.toString() + 'espected'];

      control.updateValueAndValidity();
      control2.updateValueAndValidity();

      control.valueChanges
        .do(() => {
          console.log('Aguarde...')
        })
        .debounceTime(1000)
        .subscribe(value => {
          if (!value) {
            this.snackBar.open("Por favor informe a meta de aprovados!")
            control.setValue(month.value, { emitEvent: false });
            this.dismissSnackBar();
            return;
          }
          this.createUpdateGoal(month, value, control2.value);
        })


        control2.valueChanges
        .do(() => {
          console.log('Aguarde...')
        })
        .debounceTime(1000)
        .subscribe(value => {
          if (!value) {
            this.snackBar.open("Por favor informe a meta de jobs!")
            control2.setValue(month.expected_value, { emitEvent: false });
            this.dismissSnackBar();
            return;
          }

          if (!control.value) {
            this.snackBar.open("Por favor informe a meta de aprovados!")
            this.dismissSnackBar();
            return;
          }
          
          this.createUpdateGoal(month, control.value, control2.value);
      })
    })
  }

  createUpdateGoal(goal: Goal, value: number, expectedValue: number) {
    goal.value = value;
    goal.expected_value = expectedValue;

    if (goal.id)
      this.updateGoal(goal);
    else
      this.createGoal(goal);
  }

  getValueByMonthAndYear(month: number): Goal {
    const goal = this.goals.find(x => x.year === this.year && x.month == month);

    if (!goal) {
      return;
    }

    return goal;
  }

  private fillMonthYears() {
    for (let year = this.minYear; year <= this.maxYear; year++) {
      const monthsOfYear = [];
      for (let month = 1; month <= 12; month++) {
        const date = new Date(year, month - 1, 1);
        const monthName = date.toLocaleString('default', { month: 'long' });
        monthsOfYear.push({ month: month, month_name: monthName, year: year, id: null, value: null });
      }
      this.yearsMonth.push({ year: year, months: monthsOfYear });
    }

    this.yearMonth = this.yearsMonth[this.yearsMonth.length - 1]
  }

  updateYear(yearMonth: YearsMonth) {
    this.yearMonth = yearMonth;
    this.year = yearMonth.year;
    this.updateDate();
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const keyCode = event.which || event.keyCode;
    const keyValue = String.fromCharCode(keyCode);

    if (!/^[0-9.,]$/.test(keyValue) && !event.ctrlKey && !event.metaKey) {
      event.preventDefault();
    }
  }

  addYear(increment: number) {
    var yearAux = this.year;
    yearAux += increment;

    if (yearAux > this.maxYear || yearAux < this.minYear) {
      return;
    }

    this.year += increment;
    this.yearMonth = this.yearsMonth.find(x => x.year === this.year);
    this.updateDate();
  }

  updateDate() {
    this.updateValuesFormYearsMonth();
  }

  resetForm() {
    this.goalsForm.reset();
  }

  salvar() {
    console.log(this.goalsForm.value)
  }

}
