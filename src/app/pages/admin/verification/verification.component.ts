import { NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { EventMessageService } from 'src/app/services/event-message.service';
import { ErrorMessageComponent } from 'src/app/shared/error-message/error-message.component';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'verification',
    templateUrl: './verification.component.html',
    styleUrl: './verification.component.css',
    standalone: true,
    imports: [ErrorMessageComponent, TranslateModule, NgClass, ReactiveFormsModule]
})
export class VerificationComponent {

  showError: boolean = false;
  errorMessage: string = '';

  verificationForm = new FormGroup({
    productId: new FormControl('', [Validators.required]),
    vc: new FormControl('', [Validators.required]),
  });

  constructor(
    private eventMessage: EventMessageService,
    private http: HttpClient
  ) {}

  goBack() {
    this.eventMessage.emitAdminCategories(true);
  }

  verifyCredential() {
    // Get the product specification
    const url = `${environment.BASE_URL}/admin/uploadcertificate/${this.verificationForm.value.productId}`;
    const body = {
      vc: this.verificationForm.value.vc
    }

    return this.http.patch<any>(url, body).subscribe({
      next: data => {
        this.goBack();
      },
      error: error => {
        console.error('There was an error while updating!', error);
        if(error.error.error){
          console.log(error)
          this.errorMessage = 'Error: ' + error.error.error;
        } else {
          this.errorMessage = 'There was an error while uploading the product!';
        }
        this.showError = true;
        setTimeout(() => {
          this.showError = false;
        }, 3000);
      }
    })
  }
}
