import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { MatSnackBar } from '@angular/material'

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/operator/debounceTime';


import { API } from '../app.api';
import { ErrorHandler } from '../shared/error-handler.service';
import { BriefingLevel } from './briefing-level.model';


@Injectable()
export class BriefingLevelService {
    constructor(
        private http: Http,
        private snackBar: MatSnackBar
    ) {}

    levels(query: string = ''): Observable<BriefingLevel[]> {
        let url = query === '' ? `briefing-levels/all` : `briefing-levels/filter/${query}`

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