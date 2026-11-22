import { Component, OnInit, Injectable, ElementRef, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Employee } from '../employee.model';
import { Observable } from 'rxjs/Observable';
import { EmployeeService } from '../employee.service';

@Component({
  selector: 'cb-employee-tabs',
  templateUrl: './employee-tabs.component.html',
  styleUrls: ['./employee-tabs.component.css']
})
@Injectable()
export class EmployeeTabsComponent implements OnInit {
  @ViewChild('container', { static: false }) container: ElementRef
  containerWidth: number
  typeForm: string
  employee: Employee
  isAdmin: boolean
  selectedIndex: number = 0

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
  ) { }

  ngOnInit() {
    this.typeForm = this.route.snapshot.url[0].path

    /*
    this.route.queryParams.subscribe((params) => {
      let next = params['tab']

      switch(next) {
        case 'briefing' :{
          this.selectedIndex = 1
          break
        }
        case 'project' :{
          this.selectedIndex = 2
          break
        }
        case 'proposal' :{
          this.selectedIndex = 3
          break
        }
        default :{
          this.selectedIndex = 0
        }
      }
    })
    */
  }

  setAdmin(isAdmin: boolean) {
    this.isAdmin = isAdmin
  }

  setEmployee(employee: Employee) {
    this.employee = employee
  }

  onTabChanged(index: number): Promise<boolean> | void {
    if (index === 1) {
      return this.router.navigate(['/employees/list'])
    }
  }
}
