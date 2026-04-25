import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'cb-auth-cod',
  templateUrl: './auth-cod.component.html',
  styleUrls: ['./auth-cod.component.css']
})
export class AuthCodComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  move(event: any, previous: any, next: any) {
    if (event.key === "Backspace" && previous) {
      previous.focus();
    }
    if (event.target.value && next) {
      next.focus();
    }
  }
}
