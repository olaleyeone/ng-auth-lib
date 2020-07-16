import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable, of, throwError } from 'rxjs';
import { User } from '../models/user';
import { AuthenticationService } from '../services/authentication.service';
import { NotLoggedInGuard } from './not-logged-in.guard';

describe('NotLoggedInGuard', () => {

  let guard: NotLoggedInGuard;
  let router: Router;
  let authService: AuthenticationService;

  beforeEach(() => {
    authService = {} as any;
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        {
          provide: AuthenticationService,
          useValue: {
            getUser: () => {
              return of(null);
            }
          } as any
        }
      ]
    });
    guard = TestBed.inject(NotLoggedInGuard);
    authService = TestBed.inject(AuthenticationService);
    router = TestBed.get(Router);
    spyOn(router, 'navigate');
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should activate', () => {
    authService.getUser = () => {
      return throwError({ status: 401 });
    };
    const res = guard.canActivate(null, null);
    expect(res).toBeInstanceOf(Observable);
    let activate;
    (res as Observable<boolean>).subscribe(res => {
      activate = res;
    });
    expect(activate).toBeTrue();
  });

  it('should activate with falsy user', () => {
    const res: Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree = guard.canActivate(null, null);
    expect(res).toBeInstanceOf(Observable);
    let activate;
    (res as Observable<boolean>).subscribe(res => {
      activate = res;
    });
    expect(activate).toBeTrue();
  });

  it('should not activate', () => {
    authService.getUser = () => {
      return of({} as User);
    };
    const res: Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree = guard.canActivate(null, null);
    expect(res).toBeInstanceOf(Observable);
    (res as Observable<boolean>).subscribe(activate => {
      expect(activate).toBeFalse();
    });
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});
