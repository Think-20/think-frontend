import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CedentesComponent } from './cedentes.component';

describe('CedentesComponent', () => {
  let component: CedentesComponent;
  let fixture: ComponentFixture<CedentesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CedentesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CedentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
