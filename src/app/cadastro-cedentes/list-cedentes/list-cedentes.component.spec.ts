import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCedentesComponent } from './list-cedentes.component';

describe('ListCedentesComponent', () => {
  let component: ListCedentesComponent;
  let fixture: ComponentFixture<ListCedentesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListCedentesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListCedentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
