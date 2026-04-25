import { identifierModuleUrl } from '@angular/compiler';
import { Component, OnInit, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'cb-modal-cedentes',
  templateUrl: './modal-cedentes.component.html',
  styleUrls: ['./modal-cedentes.component.css']
})
export class ModalCedentesComponent implements OnInit {
  @Output() toggleModal = new EventEmitter<void>();

  statusIncial:boolean = false;
  choiceFundo:boolean = false;
  btnNext: boolean = false;
  mostrarQuestionario: boolean = false;
  selecionado: number | null = null;

  constructor() { }


  ngOnInit() {
  }

  toggle(){
    this.statusIncial = !this.statusIncial;
    this.toggleModal.emit();
  }

  choiceBackground( id:number ){
    this.selecionado = id;
    console.log(id);
  }
  nextStep(){

    if( this.selecionado != null){
      this.mostrarQuestionario = true;
      this.statusIncial= false;
    }else{
      console.log("seleciona um fundo primeiro");
    }
  }

}
