import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentacaoCedenteComponent } from './documentacao-cedente.component';

describe('DocumentacaoCedenteComponent', () => {
  let component: DocumentacaoCedenteComponent;
  let fixture: ComponentFixture<DocumentacaoCedenteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentacaoCedenteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentacaoCedenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
