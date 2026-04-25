import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NovoCedenteComponent } from './novo-cedente.component';

describe('NovoCedenteComponent', () => {
  let component: NovoCedenteComponent;
  let fixture: ComponentFixture<NovoCedenteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NovoCedenteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NovoCedenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
