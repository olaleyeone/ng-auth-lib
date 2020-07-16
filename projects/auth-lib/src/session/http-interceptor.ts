import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { EventEmitter, Injectable, InjectionToken, Injector } from '@angular/core';
import { AsyncSubject, Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthenticationService } from '../services/authentication.service';
import { UserSession } from './user-session';

@Injectable()
export class HttpInterceptorService implements HttpInterceptor {

  private _httpError: EventEmitter<HttpErrorResponse> = new EventEmitter();

  constructor(
    // private toastr: ToastrService,
    private refreshGrantUrl: REFRESH_GRANT_URL,
    private injector: Injector,
    private userSession: UserSession
  ) {

  }

  public get httpError() {
    return this._httpError;
  }

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (this.refreshGrantUrl.toString() !== req.url && this.userSession.isLoggedIn() && !this.userSession.hasActiveAccessToken()) {
      return this.injector.get(AuthenticationService).refreshUser()
        .pipe(catchError(() => {
          return of(null);
        }), switchMap(() => {
          return this.observeResponse(next.handle(req));
        }));
    }

    return this.observeResponse(next.handle(req));
  }

  private observeResponse(responseObservable: Observable<HttpEvent<any>>) {
    const subject: AsyncSubject<HttpEvent<any>> = new AsyncSubject();
    responseObservable.subscribe(subject);

    subject.subscribe(async (event: HttpEvent<any>) => {
      if (event instanceof HttpErrorResponse) {
        if (event.status === 401) {
          if (this.userSession.hasActiveAccessToken()) {
            await this.userSession.clearStaleSession();
          }
          return;
        }
        this._httpError.emit(event);
      }
    }, async (err: HttpEvent<any>) => {
      if (err instanceof HttpErrorResponse) {
        if (err.status < 1) {
          // this.toastr.error('Please check your internet connection', 'Failed to contact server');
        }
        else if (err.status === 401) {
          if (this.userSession.hasActiveAccessToken()) {
            await this.userSession.clearStaleSession();
          }
          return;
        }
        else if (err.status === 404) {
          return;
        }
        else if (err.status === 403) {
          // this.toastr.error('You do not have permission to perform this action.', 'Access Denied');
        }
        this._httpError.emit(err);
      }
    });

    return subject;
  }
}

export class REFRESH_GRANT_URL extends InjectionToken<String>{

}