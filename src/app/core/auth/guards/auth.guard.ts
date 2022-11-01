import {Injectable} from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    CanActivateChild,
    CanLoad,
    NavigationStart,
    Route,
    Router,
    RouterStateSnapshot,
    UrlSegment,
    UrlTree
} from '@angular/router';
import {Observable, of} from 'rxjs';
import {AuthService} from 'app/core/auth/auth.service';
import {switchMap} from 'rxjs/operators';
import {environment} from "../../../../environments/environment";
import {AuthUtils} from "../auth.utils";

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanLoad {
    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _router: Router
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Can activate
     *
     * @param route
     * @param state
     */
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return this.activateRoutes(state.url === '/sign-out' ? '/' : state.url);
    }

    /**
     * Can activate child
     *
     * @param childRoute
     * @param state
     */
    canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        // const redirectUrl = state.url === '/sign-out' ? '/' : state.url;
        return this.activateRoutes(state.url === '/sign-out' ? '/' : state.url);
    }

    /**
     * Can load
     *
     * @param route
     * @param segments
     */
    canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
        return this.activateRoutes('/');
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Check the authenticated status
     *
     * @param redirectURL
     * @private
     */
    private _check(redirectURL: string): Observable<boolean> {
        // Check the authentication status
        return this._authService.check()
            .pipe(
                switchMap((authenticated) => {

                    // If the user is not authenticated...
                    if (!authenticated) {
                        // Redirect to the sign-in page
                        this._router.navigate(['sign-in'], {queryParams: {redirectURL}});

                        // Prevent the access
                        return of(false);
                    }

                    // Allow the access
                    return of(true);
                })
            );
    }

    getSessionToken() : Observable<boolean> {
        let access_token = localStorage.getItem('access_token') ?? '';
        if (access_token) {
            // if (AuthUtils.isTokenExpired(access_token)) {
            //     let refreshToken = localStorage.getItem('refresh_token');
            //     if (refreshToken) {
            //
            //         // return true;
            //         var refresh = false;
            //         this._authService.refreshToken(refreshToken).subscribe((resp:any)=>{
            //             if(resp.success){
            //                 localStorage.setItem('access_token',resp.data.access_token);
            //                 localStorage.setItem('refresh_token',resp.data.refresh_token);
            //                 refresh =true;
            //             }
            //             else{
            //                 refresh = false;
            //             }
            //
            //         })
            //         return of(refresh);
            //     }
            //     return of(false);
            // }
            return of( true);
        }
        return of( false);
    }

    private activateRoutes(route: string) {
        return this.getSessionToken()
            .pipe(
                switchMap((authenticated) => {
                    if (authenticated) {
                        if (route == '/') {
                            this._router.navigate(['/dashboard']);
                        }
                        return of(true);
                    } else {
                        localStorage.clear();
                        this._router.navigateByUrl('/sign-in');

                        // Prevent the access
                        return of(false);
                    }


                })
            );
    }


    private checkIfAccess() {
        this._router.events.subscribe((_event: any) => {
            if (_event instanceof NavigationStart) {
                if (_event?.url) {
                    if (!_event?.url.includes("sign-out")) {
                        const user = localStorage.getItem("userData");//fetchUser from session
                        if (user) {
                            let ismatch = false
                            let userData = JSON.parse(user);
                            userData.activities[0]?.forEach(item => {
                                let childURl = item?.activity_url?.includes(_event?.url);
                                if (childURl) {
                                    ismatch = true;
                                }
                            })
                            _event.url = _event.url.replace('%23', '#');
                            if (!ismatch) {
                                if (!_event?.url.includes('/dashboard')) {
                                    var route = '/'
                                    this._router.navigate(['/dashboard'], {queryParams: {route}});
                                }
                            }
                        }
                    }
                }
            }
        })
    }

}
