import { async, TestBed } from '@angular/core/testing';
import { AccessTokenApiResponse, UserApiResponse } from 'auth-api-sdk';
import * as moment from 'moment';
import { User } from '../model/user';
import { SessionService } from '../service/session-service';
import { RouteProtectionService } from '../service/route-protection-service';
import { UserSession } from './user-session';

describe('UserSession', () => {

    let accessTokenApiResponse: AccessTokenApiResponse;
    let routeProtectionService: RouteProtectionService;
    let sessionService: SessionService;
    let session: UserSession;

    beforeEach(() => {
        routeProtectionService = {
            currentRouteIsPublic: async () => {
                return false;
            }
        };

        sessionService = { handleExpiredSession: () => { }, startSession: () => { } };

        TestBed.configureTestingModule({
            providers: [
                UserSession,
                {
                    provide: RouteProtectionService,
                    useValue: routeProtectionService
                },
                {
                    provide: SessionService,
                    useValue: sessionService
                }
            ]
        });
        session = TestBed.get(UserSession);

        accessTokenApiResponse = {
            id: 1,
            displayName: 'Lee',
            emailAddresses: ['olaleyeone@gmail.com'],
            data: [],
            passwordAutoGenerated: false
        };
    });

    it('should create an instance', () => {
        expect(session).toBeTruthy();
    });

    it('should not be logged in', () => {
        expect(session.hasActiveAccessToken()).toBeFalse();
    });

    it('should be logged in', () => {
        accessTokenApiResponse.expires_at = moment().toISOString();
        session.setUser(accessTokenApiResponse);
        expect(session.hasActiveAccessToken()).toBeFalse();
    });

    it('should be logged in', () => {
        accessTokenApiResponse.expires_at = moment().add(100, 'millisecond').toISOString();
        console.log(accessTokenApiResponse.expires_at);
        session.setUser(accessTokenApiResponse);
        expect(session.hasActiveAccessToken()).toBeTrue();
    });

    it('should serve user observable', async (done) => {
        const user: User = session.setUser(accessTokenApiResponse);
        expect(user.id).toEqual(accessTokenApiResponse.id);
        expect(user.displayName).toEqual(accessTokenApiResponse.displayName);
        expect(user.emailAddress).toEqual(accessTokenApiResponse.emailAddresses[0]);
        expect(session.isLoggedIn()).toBeTrue();

        const reslveUser = await new Promise(resolve => session.user.subscribe(resolve));
        expect(reslveUser).toBe(user);
        done();
    });

    it('should update user', async (done) => {
        const userApiResponse: UserApiResponse = {
            id: 1,
            displayName: 'Lee',
            emailAddresses: ['olaleyeone@gmail.com'],
            identifiers: [{
                id: 1,
                type: 'EMAIL',
                identifier: 'olaleyeone@gmail.com'
            }],
            data: [],
            passwordAutoGenerated: false
        };

        session.updateUser(userApiResponse);

        const user: User = await new Promise(resolve => session.user.subscribe(resolve));
        expect(user.id).toEqual(userApiResponse.id);
        expect(user.displayName).toEqual(userApiResponse.displayName);
        expect(user.emailAddress).toEqual(userApiResponse.emailAddresses[0]);
        done();
    });

    it('should ignore expired session on public page', async (done) => {
        spyOn(routeProtectionService, 'currentRouteIsPublic').and.resolveTo(false);
        spyOn(sessionService, 'handleExpiredSession')
        session.setUser(accessTokenApiResponse);

        session.clearStaleSession();
        const user = await new Promise(resolve => session.user.subscribe(resolve));
        expect(user).toBeNull();
        expect(routeProtectionService.currentRouteIsPublic).toHaveBeenCalledTimes(1);
        expect(sessionService.handleExpiredSession).toHaveBeenCalledTimes(1);
        done();
    });

    it('should handle expired session on protected page', async () => {
        spyOn(routeProtectionService, 'currentRouteIsPublic').and.resolveTo(true);
        spyOn(sessionService, 'handleExpiredSession')
        session.setUser(accessTokenApiResponse);

        session.clearStaleSession();
        const user = await new Promise(resolve => session.user.subscribe(resolve));
        expect(user).toBeNull();
        expect(routeProtectionService.currentRouteIsPublic).toHaveBeenCalledTimes(1);
        expect(sessionService.handleExpiredSession).not.toHaveBeenCalled();
    });

});