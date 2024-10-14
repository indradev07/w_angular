import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, inject, NgZone, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import moment from 'moment';

@Component({
  selector: 'app-timer',
  standalone: true,
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss'],
})
export class TimerComponent implements OnInit, OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  public timeSpentInApp: string = '0';
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private ngZone = inject(NgZone);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.startTimer();
    }
  }

  private startTimer() {
    const startTime = moment();

    this.ngZone.runOutsideAngular(() => {
      this.intervalId = setInterval(() => {
        const duration = moment.duration(moment().diff(startTime));
        const formattedTime = this.formatDuration(duration);
        this.ngZone.run(() => {
          this.timeSpentInApp = formattedTime;
          this.cdr.detectChanges();
        });
      }, 1000);
    });
  }

  private formatDuration(duration: moment.Duration): string {
    const minutes = duration.minutes();
    const seconds = duration.seconds();
    const minuteLabel = minutes === 1 ? 'Minute' : 'Minutes';
    const secondLabel = seconds === 1 ? 'Second' : 'Seconds';

    return minutes
      ? `${minutes} ${minuteLabel} and ${seconds} ${secondLabel}`
      : `${seconds} ${secondLabel}`;
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

