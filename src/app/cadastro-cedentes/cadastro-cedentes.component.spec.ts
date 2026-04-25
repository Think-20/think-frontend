import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroCedentesComponent } from './cadastro-cedentes.component';

describe('CadastroCedentesComponent', () => {
  let component: CadastroCedentesComponent;
  let fixture: ComponentFixture<CadastroCedentesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CadastroCedentesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CadastroCedentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
