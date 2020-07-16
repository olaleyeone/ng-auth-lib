import { AccessTokenApiResponse } from 'auth-api-sdk';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

export abstract class SessionStarter {

    abstract handleExpiredSession(token: AccessTokenApiResponse);

    abstract startSession(next: ActivatedRouteSnapshot, state: RouterStateSnapshot);
}
