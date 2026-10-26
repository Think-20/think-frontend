import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionarioSuitabilityComponent } from './questionario-suitability.component';

describe('QuestionarioSuitabilityComponent', () => {
  let component: QuestionarioSuitabilityComponent;
  let fixture: ComponentFixture<QuestionarioSuitabilityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionarioSuitabilityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionarioSuitabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the suitability questions and answer options', () => {
    const questions = fixture.nativeElement.querySelectorAll('.question-card');

    expect(questions.length).toBe(7);
    expect(questions[0].textContent).toContain(
      'Qual seu objetivo ao investir considerando seu momento de vida e planos para o futuro?'
    );
    expect(questions[0].querySelectorAll('input[type="radio"]').length).toBe(4);
    expect(questions[1].querySelectorAll('input[type="radio"]').length).toBe(4);
    expect(questions[2].querySelectorAll('input[type="radio"]').length).toBe(4);
    expect(questions[2].textContent).toContain('Posso precisar dos meus investimentos para cobrir despesas no curto prazo');
    expect(questions[2].textContent).toContain('Preciso do valor investido para complementar minha renda');
    expect(questions[3].textContent).toContain(
      'Qual valor aproximado do seu patrimônio atual (bens materiais e investimentos financeiros)?'
    );
    expect(questions[3].querySelectorAll('input[type="radio"]').length).toBe(4);
    expect(questions[3].textContent).toContain('Acima de R$ 3 milhões');
    expect(questions[3].textContent).toContain('Entre R$ 1,5 milhão e R$ 3 milhões');
    expect(questions[3].textContent).toContain('Entre R$ 250 mil e R$ 1,5 milhão');
    expect(questions[3].textContent).toContain('Até R$ 250 mil');
    expect(questions[4].textContent).toContain('Em quais produtos você investiu nos últimos 12 meses?');
    expect(questions[4].querySelectorAll('input[type="radio"]').length).toBe(4);
    expect(questions[4].textContent).toContain('Não investi nesse período');
    expect(questions[4].textContent).toContain('Poupança, depósitos a prazo');
    expect(questions[4].textContent).toContain('investimentos vinculados à taxa de câmbio ou derivativos');
    expect(questions[5].textContent).toContain(
      'Com qual frequência você investiu nos últimos 12 meses, sem considerar aplicações automáticas?'
    );
    expect(questions[5].querySelectorAll('input[type="radio"]').length).toBe(4);
    expect(questions[5].textContent).toContain('Mais de 12 vezes');
    expect(questions[5].textContent).toContain('Entre 7 e 12 vezes');
    expect(questions[5].textContent).toContain('Entre 1 e 6 vezes');
    expect(questions[6].textContent).toContain('Com relação aos produtos de investimentos:');
    expect(questions[6].querySelectorAll('input[type="radio"]').length).toBe(4);
    expect(questions[6].textContent).toContain('Tenho conhecimento e experiência prática');
    expect(questions[6].textContent).toContain('Não possuo conhecimento nem experiência prática');
    expect(fixture.nativeElement.querySelector('.sticky-actions')).not.toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Calcular e salvar perfil');
  });

  it('should keep one answer per question and emit selected answers on submit', () => {
    let emittedAnswers: { [perguntaId: number]: string } | null = null;
    component.concluir.subscribe(answers => emittedAnswers = answers);

    const submitButton = fixture.nativeElement.querySelector('.primary-button') as HTMLButtonElement;
    expect(component.todasRespondidas).toBe(false);
    expect(submitButton.classList.contains('all-answered')).toBe(false);

    const firstAnswer = fixture.nativeElement.querySelector(
      '#suitability-1-a'
    ) as HTMLInputElement;
    firstAnswer.click();
    fixture.detectChanges();

    expect(component.respostas[1]).toBe('a');
    expect(firstAnswer.checked).toBe(true);

    const secondAnswer = fixture.nativeElement.querySelector(
      '#suitability-1-b'
    ) as HTMLInputElement;
    secondAnswer.click();
    fixture.detectChanges();
    expect(component.respostas[1]).toBe('b');

    component.perguntas.slice(1).forEach(pergunta => {
      const answer = fixture.nativeElement.querySelector(
        '#suitability-' + pergunta.id + '-a'
      ) as HTMLInputElement;
      answer.click();
      fixture.detectChanges();
    });

    expect(component.todasRespondidas).toBe(true);
    expect(submitButton.classList.contains('all-answered')).toBe(true);

    submitButton.click();
    expect(emittedAnswers).toEqual({
      1: 'b',
      2: 'a',
      3: 'a',
      4: 'a',
      5: 'a',
      6: 'a',
      7: 'a'
    });
  });

  it('should emit when the user chooses to return to the cadastral form', () => {
    const backSpy = spyOn(component.voltarFicha, 'emit');
    const backButton = fixture.nativeElement.querySelector('.secondary-button') as HTMLButtonElement;

    backButton.click();

    expect(backSpy).toHaveBeenCalled();
  });
});
