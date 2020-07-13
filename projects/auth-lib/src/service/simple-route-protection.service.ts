import { Injectable } from '@angular/core';
import { RouteProtectionService } from './route-protection-service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SimpleRouteProtectionService extends RouteProtectionService {

  constructor(private router: Router) {
    super();
  }

  async currentRouteIsPublic(): Promise<boolean> {
    let route = this.router.routerState.root;
    while (route.firstChild) {
      route = route.firstChild;
    }
    let activeUserGuard = await import('../guard/active-user.guard').then(m => m.ActiveUserGuard);
    let shouldPromptLogin = route.routeConfig?.canActivate?.includes(activeUserGuard);
    if (shouldPromptLogin) {
      return false;
    }
    let loggedInGuard = await import('../guard/logged-in.guard').then(it => it.LoggedInGuard);
    return !route.routeConfig?.canActivate?.includes(loggedInGuard);
  }
}
