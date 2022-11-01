import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import {environment} from '../../../environments/environment';

@Injectable()
export class AuthService
{

    public _authenticated: boolean = false;
    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {

        localStorage.setItem('access_token', token);
    }

    get accessToken(): string {
        return localStorage.getItem('access_token') ?? '';
    }

    refreshToken(refresh_token: string) {
        let obj = {

            refresh_token: refresh_token

        }
        return this._httpClient.post(environment.apiUrl + 'auth/refresh-token', obj).toPromise();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any>
    {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any>
    {
        return this._httpClient.post('api/auth/reset-password', password);
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { email: string; password: string }): Observable<any>
    {
        // Throw error, if the user is already logged in
        if ( this._authenticated )
        {
            return throwError('User is already logged in.');
        }

        return this._httpClient.post(environment.apiUrl + 'auth/authenticate', credentials)
    }

    /**
     * Sign in using the access token
     */
    // signInUsingToken(): Observable<any>
    // {
    //     // Renew token
    //     return this._httpClient.post('api/auth/refresh-access-token', {
    //         accessToken: this.accessToken
    //     }).pipe(
    //         catchError(() =>
    //
    //             // Return false
    //             of(false)
    //         ),
    //         switchMap((response: any) => {
    //
    //             // Store the access token in the local storage
    //             this.accessToken = response.accessToken;
    //
    //             // Set the authenticated flag to true
    //             this._authenticated = true;
    //
    //             // Store the user on the user service
    //             this._userService.user = response.user;
    //
    //             // Return true
    //             return of(true);
    //         })
    //     );
    // }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove the access token from the local storage
        localStorage.clear()
        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(obj): Observable<any>
    {
        return this._httpClient.post(environment.apiUrl + 'auth/sign-up', obj);
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: { email: string; password: string }): Observable<any>
    {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean>
    {
        // Check if the user is logged in
        if ( this._authenticated )
        {
            return of(true);
        }

        // Check the access token availability
        if ( !this.accessToken )
        {
            return of(false);
        }

        // Check the access token expire date
        if ( AuthUtils.isTokenExpired(this.accessToken) )
        {
            return of(false);
        }

        // If the access token exists and it didn't expire, sign in using it
        // return this.signInUsingToken();
    }
}
