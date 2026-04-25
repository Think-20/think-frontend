import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PartesRelacionadasComponent } from './partes-relacionadas.component';

describe('PartesRelacionadasComponent', () => {
  let component: PartesRelacionadasComponent;
  let fixture: ComponentFixture<PartesRelacionadasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PartesRelacionadasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartesRelacionadasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
