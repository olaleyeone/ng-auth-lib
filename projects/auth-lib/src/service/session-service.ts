import { AccessTokenApiResponse } from 'auth-api-sdk';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

export abstract class SessionService {

    abstract handleExpiredSession(token: AccessTokenApiResponse);

    abstract startSession(next: ActivatedRouteSnapshot, state: RouterStateSnapshot);
}
