import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { catchError, throwError, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TimerComponent } from './components/timer/timer.component';

interface Post {
    userId: number;
    id: number;
    title: string;
    body: string;
}

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, CommonModule, TimerComponent],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, OnDestroy {
    private http = inject(HttpClient);
    private cdr = inject(ChangeDetectorRef);

    public data: Post[] = [];
    public lazyComponent: any = null;
    private destroy$ = new Subject<void>();

    ngOnInit() {
        this.fetchAndHandlePostData(); 
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    fetchAndHandlePostData(): void {
        const url = 'https://jsonplaceholder.typicode.com/posts';

        this.http.get<Post[]>(url).pipe(
            takeUntil(this.destroy$),
            catchError(this.handleError)
        ).subscribe(val => {
            this.data = [...val]; 
        });
    }

    private handleError(error: any) {
        console.error('Error occurred:', error);
        return throwError(error);
    }

    async toggleComponent() {
        if (this.lazyComponent) {
            this.lazyComponent = null; 
            return;
        } 

        const { PokemonComponent } = await import('./components/pokemon/pokemon.component');
        this.lazyComponent = PokemonComponent; 
        this.cdr.detectChanges();
    }
}
