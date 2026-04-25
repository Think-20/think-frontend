import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'cb-partes-relacionadas',
  templateUrl: './partes-relacionadas.component.html',
  styleUrls: ['./partes-relacionadas.component.css']
})
export class PartesRelacionadasComponent implements OnInit {
  
  formParteRelacionadas!:FormGroup;
  formDadosComplementares!:FormGroup;
  formEndereco!:FormGroup;

  constructor( private fb:FormBuilder ){}

  ngOnInit(){

    // partes Relacionadas
    this.formParteRelacionadas = this.fb.group({
      nameCompleto:[''],
      parteRelacionada:[''],
      email:[''],
      faturamento_anual:[''],
      assinantes:[''],
      cep:[''],
      nacionalidade:[''],
      cpf:[''],
      telCadastro:[''],
      beneficiarioCedente:[''],
      assinanteOperacao:[''],
      assinante:[''],
    }),

    // Dados Complementares
    this.formDadosComplementares = this.fb.group({
      estadoCivil:[''],
      regimeCasamento:[''],
      profissao:['']
    }),

    // enederecos
    this.formEndereco = this.fb.group({
      cep:[''],
      bairro:[''],
      rua:[''],
      uf:[''],
      localNumber:[''],
      city:[''],
      complemento:[''],
      pais:['']
    })
  }

}
