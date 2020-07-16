import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { UserIdentifierControllerService } from 'auth-api-sdk';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class UniqueIdentifierValidator {

    constructor(private userIdentifierControllerService: UserIdentifierControllerService) {

    }

    uniqueEmail(errorName?: string): AsyncValidatorFn {

        return (control: AbstractControl): Observable<ValidationErrors | null> => {

            if (!control.value) {
                return of(null);
            }

            const val: ValidationErrors = {};
            val[errorName || 'existingEmail'] = true;

            return this.userIdentifierControllerService
                .checkEmailExistence({ email: control.value })
                .pipe(map(response => {
                    return val;
                }))
                .pipe(catchError((err: HttpErrorResponse, caught) => {
                    if (err.status == 404) {
                        return of(null);
                    }
                    return of(val);
                }));
        };
    }
}
