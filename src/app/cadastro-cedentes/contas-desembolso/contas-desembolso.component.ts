import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'cb-contas-desembolso',
  templateUrl: './contas-desembolso.component.html',
  styleUrls: ['./contas-desembolso.component.css']
})

export class ContasDesembolsoComponent implements OnInit {

  // formulario
  formularioDesembolso!: FormGroup;

  constructor( private fb: FormBuilder ){}
  
  ngOnInit() {
    this.formularioDesembolso = this.fb.group({
      tiposConta:[''],
      codBanco:[''],
      agenciaBanco:[''],
      numConta:[''],
      description:[''],
    })
  }

}
