import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {fuseAnimations} from '@fuse/animations';
import {FuseAlertType} from '@fuse/components/alert';
import {AuthService} from 'app/core/auth/auth.service';
import {ToastrService} from "ngx-toastr";
import {NgxSpinnerService} from "ngx-spinner";
import {finalize} from "rxjs/operators";

@Component({
    selector: 'auth-sign-up',
    templateUrl: './sign-up.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class AuthSignUpComponent implements OnInit {
    @ViewChild('signUpNgForm') signUpNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: ''
    };
    signUpForm: FormGroup;
    showAlert: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private toastrService: ToastrService,
        private spinner: NgxSpinnerService
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.signUpForm = this._formBuilder.group({
                userName: ['', Validators.required],
                email: ['', [Validators.required, Validators.email]],
                phoneNumber: ['', [Validators.required]],
                password: ['', Validators.required],
                confirmPassword: ['', Validators.required],
            }
        );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign up
     */
    signUp(): void {
        // Do nothing if the form is invalid
        let obj =
            {
                "userName": this.signUpForm.value.userName,
                "email": this.signUpForm.value.email,
                "phoneNumber": this.signUpForm.value.phoneNumber,
                "password": this.signUpForm.value.password,
                "confirmPassword": this.signUpForm.value.confirmPassword,
                "roleId": "63218c9235d3c25e4a9f44f4"
            }

        if ( this.signUpForm.invalid )
        {
            return;
        }

        this.showAlert = false;
        this.spinner.show();
        this._authService.signUp(obj).pipe(
            finalize(() => {
                this.spinner.hide();
            })
        )
            .subscribe(
                (response: any) => {
                    if(response.success){
                        this.toastrService.success("Registered Successfully!", 'Success');
                        this._router.navigateByUrl('/sign-in');
                    }else{
                        this.toastrService.error(response.message, 'Error')
                        this.alert = {
                            type: 'error',
                            message: response.message
                        }
                        this.showAlert = true;
                        response = null;
                    }
                },
                (response) => {
                    this.alert = {
                        type   : 'error',
                        message: response.message
                    };

                    // Show the alert
                    this.showAlert = true;
                }
            );
    }
}
