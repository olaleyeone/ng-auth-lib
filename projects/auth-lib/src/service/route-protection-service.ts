export abstract class RouteProtectionService {

    abstract currentRouteIsPublic(): Promise<boolean>;
}
