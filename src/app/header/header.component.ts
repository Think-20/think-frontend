import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { DatePipe } from "@angular/common";
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { API } from "app/app.api";
import { UserNotification } from "app/notification-bar/user-notification/user-notification.model";
import { UserNotificationService } from "app/notification-bar/user-notification/user-notification.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "cb-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Output() toggleMenu = new EventEmitter();
  @Output() toggleFeed = new EventEmitter();

  api = API;

  notReads = 0;
  userNotifications: UserNotification[] = [];

  iconSize = "lg";

  private onDestroy$ = new Subject<void>();

  constructor(
    private datePipe: DatePipe,
    private breakpointService: BreakpointObserver,
    private userNotificationService: UserNotificationService,
  ) {}

  ngOnInit() {
    this.sideEffectByBreakpointsControls();
  }

  private sideEffectByBreakpointsControls(): void {
    const controls = {
      toggle: "(min-width: 1200px)",
      iconSize: "(min-width: 430px)",
    };

    this.breakpointService
      .observe([controls.toggle, controls.iconSize])
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((value) => {
        this.initToggleMenu(value.breakpoints[controls.toggle]);

        this.iconSize = value.breakpoints[controls.iconSize] ? "lg" : "md";
      });
  }

  private initToggleMenu(isDesktop: boolean): void {
    if (isDesktop) {
      const opened = localStorage.getItem("toggle") !== "closed";

      this.toggle(opened);

      return;
    }

    const openedMenu = localStorage.getItem("menu") !== "closed";
    const openedFeed = localStorage.getItem("feed") !== "closed";

    this.openMenu(openedMenu);
    this.openFeed(openedFeed);
  }

  toggle(force: boolean = null): void {
    let opened = force;

    if (force === null) {
      opened = localStorage.getItem("toggle") !== "closed";

      opened = !opened;
    }

    localStorage.setItem("toggle", opened ? "opened" : "closed");

    this.toggleMenu.emit(opened);
    this.toggleFeed.emit(opened);
  }

  openMenu(force: boolean = null): void {
    let opened = force;

    if (force === null) {
      opened = localStorage.getItem("menu") !== "closed";

      opened = !opened;
    }

    localStorage.setItem("menu", opened ? "opened" : "closed");

    this.toggleMenu.emit(opened);
  }

  openFeed(force: boolean = null): void {
    let opened = force;

    if (force === null) {
      opened = localStorage.getItem("feed") !== "closed";

      opened = !opened;
    }

    localStorage.setItem("feed", opened ? "opened" : "closed");

    this.toggleFeed.emit(opened);
  }

  notificationsLoaded(userNotifications: UserNotification[]) {
    let filteredUserNotifications = userNotifications.filter(
      (userNotification) => {
        return userNotification.special == 1;
      },
    );
    if (filteredUserNotifications.length == 0) return;

    this.notReads =
      this.notReads +
      filteredUserNotifications.filter((userNotification) => {
        return userNotification.read == 0;
      }).length;

    this.userNotifications = filteredUserNotifications.concat(
      this.userNotifications,
    );
  }

  readMessages() {
    let notReadNotifications = this.userNotifications.filter(
      (userNotification) => {
        return userNotification.read == 0;
      },
    );

    if (notReadNotifications.length == 0) {
      return;
    }

    this.userNotificationService
      .read(notReadNotifications)
      .subscribe((data) => {
        if (!data.status) {
          return;
        }

        let date = new Date();

        this.userNotifications.forEach((userNotification) => {
          if (userNotification.read == 1) {
            return;
          }

          userNotification.read = 1;

          userNotification.read_date = this.datePipe.transform(
            date,
            "yyyy-MM-dd hh:mm:ss",
          );
        });

        this.notReads = 0;
      });
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
