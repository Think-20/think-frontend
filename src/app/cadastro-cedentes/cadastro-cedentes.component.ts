import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FinalityService } from 'app/finality/finality.service';

@Component({
  selector: 'cb-cadastro-cedentes',
  templateUrl: './cadastro-cedentes.component.html',
  styleUrls: ['./cadastro-cedentes.component.css']
})
export class CadastroCedentesComponent implements OnInit {

  mostrarKanban: boolean = true;
  mostrarNovoCedente: boolean = false;

  // formulario
  formFiltroSla!:FormGroup;

  constructor(private fb: FormBuilder) { }
  
  ngOnInit() {
    this.formFiltroSla = this.fb.group({
      pesquisa:['']
    })
  }

  abrirNovoCedente(){
    this.mostrarKanban = false;
    this.mostrarNovoCedente = true;
  }

  voltarKanban(){
    this.mostrarKanban = true;
    this.mostrarNovoCedente = false;
  }

}
