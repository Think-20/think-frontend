import { AfterViewInit, Component } from '@angular/core';
import { MatDialog } from '@angular/material';
import { NavigationEnd, Router } from '@angular/router';
import { AlertsCheckInComponent } from 'app/alerts/components/alerts-check-in/alerts-check-in.component';
import { CheckInNotificationService } from 'app/shared/services/check-in-notification.service';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'cb-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements AfterViewInit {
  currentRoute: string;

  onDestroy$ = new Subject<boolean>();

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private checkInNotificationService: CheckInNotificationService,
  ) {
    router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = location.pathname.replace('/', '');
      }
    });
  }

  ngAfterViewInit(): void {
    this.openCheckInNotificationsModal();

    this.observerCheckInNotifications();
  }
  
  private observerCheckInNotifications(): void {
    const twoHoursInMilliseconds = 2 * 60 * 60 * 1000;

    const timer$ = interval(twoHoursInMilliseconds);
    
    timer$
      .pipe(takeUntil(this.onDestroy$))
      .subscribe({ next: () => this.openCheckInNotificationsModal() });
  }

  private openCheckInNotificationsModal() {
    this.checkInNotificationService.hasNotifications().subscribe({
      next: (hasCheckInNotifications) => {
        if (hasCheckInNotifications) {
          this.dialog.open(AlertsCheckInComponent, {
            width: '925px'
          });
        }
      },
    });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
  }
}
