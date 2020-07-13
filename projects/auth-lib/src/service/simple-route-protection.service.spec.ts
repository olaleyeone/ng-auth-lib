import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ActiveUserGuard } from '../guard/active-user.guard';
import { LoggedInGuard } from '../guard/logged-in.guard';
import { SimpleRouteProtectionService } from './simple-route-protection.service';


describe('SimpleRouteProtectionService', () => {

  let service: SimpleRouteProtectionService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule]
    });
    service = TestBed.inject(SimpleRouteProtectionService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be created', async () => {
    (router as any).routerState = {
      root: {
        firstChild: {

        },
        routeConfig: {
          canActivate: []
        }
      }
    } as any;

    const isPublic = await service.currentRouteIsPublic();
    expect(isPublic).toBeTrue();
  });

  it('should be public route', async () => {
    (router as any).routerState = {
      root: {
        firstChild: {

        }
      }
    } as any;

    const isPublic = await service.currentRouteIsPublic();
    expect(isPublic).toBeTrue();
  });

  it('should not be public route', async () => {
    (router as any).routerState = {
      root: {
        firstChild: {
          routeConfig: {
            canActivate: [LoggedInGuard]
          }
        }
      }
    } as any;

    const isPublic = await service.currentRouteIsPublic();
    expect(isPublic).toBeFalse();
  });

  it('should not be public route', async () => {
    (router as any).routerState = {
      root: {
        firstChild: {
          routeConfig: {
            canActivate: [ActiveUserGuard]
          }
        }
      }
    } as any;

    const isPublic = await service.currentRouteIsPublic();
    expect(isPublic).toBeFalse();
  });

});
