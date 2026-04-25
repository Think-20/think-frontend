import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'cb-cedentes',
  templateUrl: './cedentes.component.html',
  styleUrls: ['./cedentes.component.css']
})
export class CedentesComponent implements OnInit {
  
  showModal = false;

  constructor() {}
  ngOnInit() {}

  openModal(){
    this.showModal = true;
  }

  closeModal(){
    this.showModal = false;
  }

}
