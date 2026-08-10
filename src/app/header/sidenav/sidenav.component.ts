import { Component, OnInit, Injectable, Output, ElementRef, Renderer, ViewChild } from '@angular/core';
import { trigger, style, state, transition, animate, keyframes } from '@angular/animations';
import { Router } from '@angular/router';

import { AuthService } from '../../login/auth.service';
import { User } from '../../user/user.model';
import { API, FRONTEND_VERSION, BACKEND_VERSION } from 'app/app.api';

@Component({
  selector: 'cb-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css'],
  animations: [
    trigger('rowAppeared', [
      state('ready', style({opacity: 1})),
      transition('void => ready', animate('300ms 0s ease-in', keyframes([
        style({opacity: 0, transform: 'translateX(-30px)', offset: 0}),
        style({opacity: 0.8, transform: 'translateX(10px)', offset: 0.8}),
        style({opacity: 1, transform: 'translateX(0px)', offset: 1})
      ]))),
      transition('ready => void', animate('300ms 0s ease-out', keyframes([
        style({opacity: 1, transform: 'translateX(0px)', offset: 0}),
        style({opacity: 0.8, transform: 'translateX(-10px)', offset: 0.2}),
        style({opacity: 0, transform: 'translateX(30px)', offset: 1})
      ]))),
    ])
  ]
})
@Injectable()
export class SidenavComponent implements OnInit {

  state = 'ready'
  opened: boolean = true
  user: User

  administradores = false
  adiministrativo = false
  diretoria = false
  producao = false
  orcamento = false
  criacao = false
  events = false
  planejamento = false
  reports = false
  centroCusto = false
  atendimento = false
  clients = false
  API = API
  FRONTEND_VERSION = FRONTEND_VERSION
  BACKEND_VERSION = BACKEND_VERSION
  configuracao = false
  exibeSomenteCadastro = false

  constructor(
    private auth: AuthService,
    private route: Router
  ) { }

  hasNoPermission(user: User, url: string): boolean {
    return user.displays.filter(display => {
        return display.url === url
        && display.access === 'N'
    }).length > 0
  }
  ngOnInit() {
    this.user = this.auth.currentUser()

    const roleTopLevel = this.user && (this.user as any).cedente_role && (this.user as any).cedente_role.id;
    const roleEmployee = this.user && this.user.employee && (this.user.employee as any).cedente_role && (this.user.employee as any).cedente_role.id;
    const roleId = this.normalizarRoleId(roleTopLevel != null ? roleTopLevel : roleEmployee);

    // Regra de visibilidade do menu lateral:
    // 1 e 2 = somente Cadastro | 3 ou null = menu completo.
    this.exibeSomenteCadastro = roleId === 1 || roleId === 2;
  }

  private normalizarRoleId(value: any): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const roleId = Number(value);
    return Number.isNaN(roleId) ? null : roleId;
  }

  toggleMenu() {
    this.opened = this.opened === true ? false : true
  }
}
