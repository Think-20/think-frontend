import { DatePipe } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { API } from "app/app.api";
import { UserNotification } from "app/notification-bar/user-notification/user-notification.model";
import { UserNotificationService } from "app/notification-bar/user-notification/user-notification.service";

@Component({
  selector: "cb-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit {
  @Input() opened: boolean;
  @Output() toggleMenuEmitter = new EventEmitter();

  api = API;

  notReads = 0;
  userNotifications: UserNotification[] = [];

  constructor(
    private datePipe: DatePipe,
    private userNotificationService: UserNotificationService
  ) {}

  ngOnInit() {
    let menu = localStorage.getItem("menu");

    if (menu === "closed") {
      this.toggleMenu();
    }
  }

  toggleMenu() {
    this.opened = this.opened ? false : true;
    localStorage.setItem("menu", this.opened ? "open" : "closed");
    this.toggleMenuEmitter.emit(this.opened);
  }

  notificationsLoaded(userNotifications: UserNotification[]) {
    let filteredUserNotifications = userNotifications.filter(
      (userNotification) => {
        return userNotification.special == 1;
      }
    );
    if (filteredUserNotifications.length == 0) return;

    this.notReads =
      this.notReads +
      filteredUserNotifications.filter((userNotification) => {
        return userNotification.read == 0;
      }).length;

    this.userNotifications = filteredUserNotifications.concat(
      this.userNotifications
    );
  }

  readMessages() {
    let notReadNotifications = this.userNotifications.filter(
      (userNotification) => {
        return userNotification.read == 0;
      }
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
            "yyyy-MM-dd hh:mm:ss"
          );
        });

        this.notReads = 0;
      });
  }
}
