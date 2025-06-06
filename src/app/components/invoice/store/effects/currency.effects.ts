import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, delay, map, mergeMap } from 'rxjs/operators';
import * as CurrencyActions from '../actions/currency.actions';
import { Currency } from '../model/currency.model';
import { countries } from './country-list';

@Injectable()
export class CurrencyEffects {
  constructor(private actions$: Actions) { }

  loadCurrencies$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CurrencyActions.loadCurrencies),
      mergeMap(() => {
        const currenciesAll = countries.map((country) => country.currency);
        const currencies = Array.from(
          new Map(currenciesAll.map((c) => [c.name, c])).values()
        );
        return of(currencies).pipe(
          delay(500),
          map((result: Currency[]) =>
            CurrencyActions.loadCurrenciesSuccess({ currencies: result })
          ),
          catchError((error) =>
            of(CurrencyActions.loadCurrenciesFailure({ error: error.message }))
          )
        );
      })
    )
  );
}
