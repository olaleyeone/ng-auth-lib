import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  AccessTokenApiResponse,
  AccessTokenControllerService,
  PasswordLoginApiRequest,
  PasswordLoginControllerService,
  LogoutControllerService,
  PasswordResetControllerService,
  PasswordUpdateControllerService,
  UserApiResponse
} from 'auth-api-sdk';
import { AsyncSubject, Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { UserSession } from '../session/user-session';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private accessTokenRequest: Observable<AccessTokenApiResponse>;

  constructor(
    private userSession: UserSession,
    private accessTokenControllerService: AccessTokenControllerService,
    private loginController: PasswordLoginControllerService,
    private logoutController: LogoutControllerService,
    private passwordResetControllerService: PasswordResetControllerService,
    private passwordUpdateControllerService: PasswordUpdateControllerService
  ) {
    this.refreshUser();
  }

  getUser() {
    return this.userSession.user;
  }

  login(loginApiRequest: PasswordLoginApiRequest) {
    return this.loginController.login({ passwordLoginApiRequest: loginApiRequest })
      .pipe(tap(accessTokenApiResponse => {
        this.userSession.setUser(accessTokenApiResponse);
      }));
  }

  // register(userRegistrationApiRequest: UserRegistrationApiRequest) {
  //   return this.userRegistrationControllerService.registerUser({
  //     userApiRequest: {
  //       email: userRegistrationApiRequest.email,
  //       emailVerificationCode: userRegistrationApiRequest.emailVerificationCode,
  //       firstName: userRegistrationApiRequest.firstName,
  //       lastName: userRegistrationApiRequest.lastName,
  //       password: userRegistrationApiRequest.password
  //     }
  //   })
  //     .pipe(tap(accessTokenApiResponse => {
  //       this.userSession.setUser(accessTokenApiResponse);
  //     }));
  // }

  resetPassword(data: { email: string, resetToken: string, password: string }) {
    return this.passwordResetControllerService.resetPasswordWithEmailAndResetToken({
      email: data.email,
      resetToken: data.resetToken,
      passwordResetApiRequest: {
        password: data.password
      }
    }).pipe(map(accessTokenApiResponse => {
      if (!accessTokenApiResponse.access_token) {
        return null;
      }
      return this.userSession.setUser(accessTokenApiResponse);
    }));
  }

  changePassword(password: string, currentPassword?: string) {
    return this.passwordUpdateControllerService.changePassword({
      passwordUpdateApiRequest: {
        password, currentPassword
      }
    }).pipe(tap((userApiResponse: UserApiResponse) => {
      this.userSession.updateUser(userApiResponse);
    }));
  }

  logout() {
    return this.logoutController.logout()
      .pipe(tap(async () => {
        await this.userSession.clearStaleSession();
      }), catchError(async (err: HttpErrorResponse) => {
        if (err.status == 401) {
          await this.userSession.clearStaleSession();
          return of({});
        }
        return throwError(err);
      }));
  }

  refreshUser(): Observable<AccessTokenApiResponse> {
    if (this.accessTokenRequest) {
      return this.accessTokenRequest;
    }
    const subject = new AsyncSubject<AccessTokenApiResponse>();
    const accessTokenRequest = this.accessTokenControllerService.getAccessToken({ accessTokenApiRequest: {} });
    accessTokenRequest.subscribe(
      (u: any) => {
        subject.next(u);
        subject.complete();
        this.accessTokenRequest = null;
        this.userSession.setUser(u);
      },
      async (err: HttpErrorResponse) => {
        subject.error(err);
        subject.complete();
        this.accessTokenRequest = null;
        if (err.error === 'ACCOUNT_DEACTIVATED') {
          // this.toastr.info('Your Account has been DEACTIVATED!');
          await this.userSession.clearStaleSession();
        } else if (err.status === 401) {
          await this.userSession.clearStaleSession();
        }
      });
    return this.accessTokenRequest = subject;
  }
}
