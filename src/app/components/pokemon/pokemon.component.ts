import { Component, OnInit, OnDestroy, ChangeDetectorRef, ChangeDetectionStrategy, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, Observable, Subject, takeUntil, throwError } from 'rxjs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FileDownloadService } from '../../services/file-download.service';
import { CommonModule } from '@angular/common';

interface Pokemon {
    name: string;
    height: number;
    weight: number;
    id: number;
    moves: Array<{ move: { name: string } }>;
}

@Component({
    selector: 'app-pokemon',
    standalone: true,
    imports: [NgxDatatableModule, CommonModule],
    templateUrl: './pokemon.component.html',
    styleUrls: ['./pokemon.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonComponent implements OnInit, OnDestroy {
    private http = inject(HttpClient);
    private fileDownloadService = inject(FileDownloadService);
    private cdr = inject(ChangeDetectorRef);

    private destroy$ = new Subject<void>(); 
    public rows: Pokemon[] = [];
    public columns = [
        { prop: 'name', name: 'Name' },
        { prop: 'height', name: 'Height' },
        { prop: 'weight', name: 'Weight' },
        { prop: 'id', name: 'Rank' }
    ];
    public loading = true;

    ngOnInit() {
        this.loadPokemons();
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete(); 
    }

    private fetchPokemonData(rank: number): Observable<Pokemon> {
        return this.http.get<Pokemon>(`https://pokeapi.co/api/v2/pokemon/${rank}`).pipe(
            catchError(this.handleError)
        );
    }

    private loadPokemons() {
        this.loading = true;

        const randomNumbers = Array.from({ length: 200 }, () => Math.floor(Math.random() * 500) + 1);
        const pokemonRequests = randomNumbers.map(num => this.fetchPokemonData(num));

        forkJoin(pokemonRequests).pipe(
            takeUntil(this.destroy$) 
        ).subscribe({
            next: (responses: Pokemon[]) => {
                this.rows = responses.map(response => ({
                    name: response.name,
                    height: response.height,
                    weight: response.weight,
                    id: response.id,
                    moves: response.moves || [] 
                }));
                this.loading = false; 
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Error occurred while loading pokemons:', err);
                this.loading = false;
                this.cdr.markForCheck();
            },
        });
    }

    private handleError(error: any) {
        console.error('API Error:', error);
        return throwError(error);
    }

    public download() {
        this.fileDownloadService.downloadAsCSV(this.rows, 'pokemons.csv');
    }

    public onActivate(event: any) {
        if (event.type === 'click') {
            this.getPokemonDetails(event.row.id);
        }
    }

    private getPokemonDetails(input: number) {
      const pokemon = this.rows.find(p => p.id === input);
        
        if (pokemon) {
            const moves = pokemon.moves.map(move => move.move.name);
            alert(`Moves:\n${moves.length ? moves.join(', \n') : 'No moves available'}`);
        } else {
            alert(`No Pokémon found with rank: ${input}`);
        }
    }
}

