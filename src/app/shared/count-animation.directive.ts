import { Directive, OnInit, Input, ElementRef, Renderer2, Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, Observable, ReplaySubject, animationFrameScheduler, combineLatest, interval } from "rxjs";
import { distinctUntilChanged, endWith, map, switchMap, takeUntil, takeWhile } from "rxjs/operators";

const easeOutQuad = (x: number): number => x * (2 - x);

@Directive({
  selector: '[countUp]',
})
export class CountUpDirective implements OnInit {
  private readonly count$ = new BehaviorSubject(0);
  private readonly duration$ = new BehaviorSubject(2000);

  private readonly currentCount$ = combineLatest([
    this.count$,
    this.duration$,
  ]).pipe(
    switchMap(([count, duration]) => {
      const startTime = animationFrameScheduler.now();

      return interval(0, animationFrameScheduler).pipe(
        map(() => animationFrameScheduler.now() - startTime),
        map((elapsedTime) => elapsedTime / duration),
        takeWhile((progress) => progress <= 1),
        map(easeOutQuad),
        map((progress) => Math.round(progress * count)),
        endWith(count),
        distinctUntilChanged()
      );
    }),
  );

  @Input('countUp')
  set count(count: number) {
    this.count$.next(count);
  }

  @Input()
  set duration(duration: number) {
    this.duration$.next(duration);
  }

  constructor(
    private readonly elementRef: ElementRef,
    private readonly renderer: Renderer2,
    private readonly destroy$: Destroy
  ) {}

  ngOnInit(): void {
    this.displayCurrentCount();
  }

  private displayCurrentCount(): void {
    this.currentCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe((currentCount) => {
        this.renderer.setProperty(
          this.elementRef.nativeElement,
          'innerHTML',
          currentCount.toLocaleString(undefined, {
            minimumIntegerDigits: 2,
          })
        );
      });
  }
}

@Injectable()
export class Destroy extends Observable<void> implements OnDestroy {
  private readonly destroySubject$ = new ReplaySubject<void>(1);

  constructor() {
    super((subscriber) => this.destroySubject$.subscribe(subscriber));
  }

  ngOnDestroy(): void {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }
}
