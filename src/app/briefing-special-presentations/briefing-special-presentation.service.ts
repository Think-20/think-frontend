import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { MatSnackBar } from '@angular/material'

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/operator/debounceTime';


import { API } from '../app.api';
import { ErrorHandler } from '../shared/error-handler.service';
import { BriefingSpecialPresentation } from './briefing-special-presentation.model';


@Injectable()
export class BriefingSpecialPresentationService {
    constructor(
        private http: Http,
        private snackBar: MatSnackBar
    ) {}

    briefingSpecialPresentations(query: string = ''): Observable<BriefingSpecialPresentation[]> {
        let url = query === '' ? `briefing-special-presentations/all` : `briefing-special-presentations/filter/${query}`

        return this.http.get(`${API}/${url}`)
            .map(response => response.json())
            .catch((err) => {
                this.snackBar.open(ErrorHandler.message(err), '', {
                    duration: 3000
                })
                return ErrorHandler.capture(err)
            })
    }
}