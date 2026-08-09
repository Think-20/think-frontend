import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocCedenteInfoComponent } from './doc-cedente-info.component';

describe('DocCedenteInfoComponent', () => {
  let component: DocCedenteInfoComponent;
  let fixture: ComponentFixture<DocCedenteInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocCedenteInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocCedenteInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
