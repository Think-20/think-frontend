import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'cb-novo-cedente',
  templateUrl: './novo-cedente.component.html',
  styleUrls: ['./novo-cedente.component.css']
})
export class NovoCedenteComponent implements OnInit {

  mostrarCadastro: boolean = true;
  mostrarDocumentacao: boolean = false;
  mostrarFormPartesRelacionadas: boolean = false;
  mostrarDesembolso: boolean = false;
  mostrarContrato: boolean = false;
  
  // formulario
  formDadosCadastrais!:FormGroup;
  formInfoGeral!:FormGroup;

  constructor( private fb:FormBuilder ){}
  ngOnInit(){
    this.formDadosCadastrais = this.fb.group({
      nome_razaoSocial:[''],
      cpf_cnpj: [''],
      email: [''],
      faturamento_anual:[''],
      assinantes:[''],
      cep:[''],
      rua:[''],
      number_end:[''],
      complemento:[''],
      bairro:[''],
      check_financeiro_nacional:[''],
    }),

    // formulario Container Infogeral
    this.formInfoGeral = this.fb.group({
      optionEstado:[''],
      tel:[''],
      city:[''],
      pais:['']
    })
  }

  abrirCadastroDoc(){
    this.mostrarCadastro = false;
    this.mostrarDocumentacao = true;
  }

  voltarCadastro(){
    this.mostrarCadastro = true;
    this.mostrarDocumentacao = false;
  }
  
  abrirPartesRelacionadas(){
    this.mostrarCadastro = false;
    this.mostrarFormPartesRelacionadas = true;
  }

  closePartesRelacionadas(){
    this.mostrarCadastro = true;
    this.mostrarFormPartesRelacionadas = false;
  }
  
  abrirDesembolso(){
    this.mostrarCadastro = false;
    this.mostrarDesembolso = true;
  }

  closeDesembolso(){
    this.mostrarCadastro = true;
    this.mostrarDesembolso = false;
  }
  
  abrirContrato(){
    this.mostrarContrato = true;
    this.mostrarDocumentacao = false;
  }

  closeContrato(){
    this.mostrarContrato = false;
    this.mostrarDocumentacao = true;
  }
}
