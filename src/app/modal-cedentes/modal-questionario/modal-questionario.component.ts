import { Component, OnInit, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'cb-modal-questionario',
  templateUrl: './modal-questionario.component.html',
  styleUrls: ['./modal-questionario.component.css']
})
export class ModalQuestionarioComponent implements OnInit {
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
    this.btnNext = !this.btnNext;
    
    if( this.selecionado != null){
      console.log("ele quer ir para o próximo !");
      
      this.statusIncial = false;

      this.mostrarQuestionario = true;


    }else{
      console.log("seleciona um fundo primeiro");
    }
  }

}
