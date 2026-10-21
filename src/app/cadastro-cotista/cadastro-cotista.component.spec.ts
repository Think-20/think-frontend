import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CadastroCotistaComponent } from './cadastro-cotista.component';

describe('CadastroCotistaComponent', () => {
  let component: CadastroCotistaComponent;
  let fixture: ComponentFixture<CadastroCotistaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CadastroCotistaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CadastroCotistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
