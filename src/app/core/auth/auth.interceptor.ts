import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, switchMap, map} from 'rxjs/operators';
import {AuthService} from 'app/core/auth/auth.service';
import {AuthUtils} from 'app/core/auth/auth.utils';
import {Router} from "@angular/router";
import {fromPromise} from "rxjs/internal-compatibility";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    /**
     * Constructor
     */
    constructor(private _authService: AuthService,
                private _router: Router) {
    }

    /**
     * Intercept
     *
     * @param req
     * @param next
     */
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Clone the request object

        debugger
        let newReq = req.clone();
        if(!newReq.url.includes){
            newReq = req.clone({
                headers: req.headers
            });

            if (this._authService.accessToken && !AuthUtils.isTokenExpired(this._authService.accessToken)) {
                newReq = req.clone({
                    headers: req.headers.set('Authorization', 'Bearer ' + this._authService.accessToken)
                });
            }
        }
        return next.handle(newReq).pipe(catchError((error: any) => {
                if (error instanceof HttpErrorResponse && error.status === 401) {
                    let refresh_token = localStorage.getItem('refresh_token');
                    if (refresh_token) {

                        return fromPromise(this._authService.refreshToken(refresh_token)).pipe(switchMap((resp: any) => {
                            if (resp.success) {

                                localStorage.setItem('access_token', resp.data.access_token);
                                localStorage.setItem('refresh_token', resp.data.refresh_token);
                                newReq = req.clone({
                                    headers: req.headers.set('Authorization', 'Bearer ' + this._authService.accessToken)
                                });
                                return next.handle(newReq);
                            }
                            localStorage.clear();
                            this._router.navigateByUrl('/sign-in');
                            return throwError(error);
                        }))
                    }

                }
                return throwError(error);
            })
        );
    }
}
