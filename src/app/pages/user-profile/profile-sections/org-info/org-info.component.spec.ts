import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { OrgInfoComponent } from './org-info.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { AuthService } from 'src/app/guard/auth.service';
import { authServiceMock, oidcSecurityServiceMock } from 'src/testing/mocks/oidc-security.service.mock';
import { AccountServiceService } from 'src/app/services/account-service.service';
import { AttachmentServiceService } from 'src/app/services/attachment-service.service';
import { EventMessageService } from 'src/app/services/event-message.service';
import { of } from 'rxjs';

describe('OrgInfoComponent', () => {
  let component: OrgInfoComponent;
  let fixture: ComponentFixture<OrgInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock }, 
        { provide: OidcSecurityService, useValue: oidcSecurityServiceMock },
      ],
      imports: [OrgInfoComponent, HttpClientTestingModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrgInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('OrgInfoComponent', () => {
    let component: OrgInfoComponent;
    let fixture: ComponentFixture<OrgInfoComponent>;
    let accountService: AccountServiceService;
    let attachmentService: AttachmentServiceService;
    let eventMessage: EventMessageService;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        providers: [
          { provide: AuthService, useValue: authServiceMock },
          { provide: OidcSecurityService, useValue: oidcSecurityServiceMock },
        ],
        imports: [OrgInfoComponent, HttpClientTestingModule]
      })
      .compileComponents();
      
      fixture = TestBed.createComponent(OrgInfoComponent);
      component = fixture.componentInstance;

      accountService = TestBed.inject(AccountServiceService);
      attachmentService = TestBed.inject(AttachmentServiceService);
      eventMessage = TestBed.inject(EventMessageService);

      jest.spyOn(accountService, 'getOrgInfo').mockImplementation(() => Promise.resolve({}));
      jest.spyOn(accountService, 'updateOrgInfo').mockReturnValue(of({}));
      jest.spyOn(attachmentService, 'uploadFile').mockReturnValue(of({}));
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should add email contact medium on saveMedium when emailSelected', () => {
      component.emailSelected = true;
      component.addressSelected = false;
      component.phoneSelected = false;
      component.mediumForm.controls['email'].setValue('test@example.com');
      component.saveMedium();
      const added = component.contactmediums.find(m => m.mediumType === 'Email' && m.characteristic?.emailAddress === 'test@example.com');
      expect(added).toBeDefined();
    });

    it('should set validators and flags when onTypeChange to email/address/phone', () => {

      component.onTypeChange({ target: { value: 'email' } });
      expect(component.emailSelected).toBe(true);
      expect(component.addressSelected).toBe(false);
      expect(component.phoneSelected).toBe(false);
      component.mediumForm.controls['email'].setValue('');
      component.mediumForm.controls['email'].updateValueAndValidity();
      expect(component.mediumForm.controls['email'].invalid).toBe(true); // required

      component.onTypeChange({ target: { value: 'address' } });
      expect(component.emailSelected).toBe(false);
      expect(component.addressSelected).toBe(true);
      expect(component.phoneSelected).toBe(false);
      component.mediumForm.controls['country'].setValue('');
      component.mediumForm.controls['country'].updateValueAndValidity();
      expect(component.mediumForm.controls['country'].invalid).toBe(true); // required

      component.onTypeChange({ target: { value: 'phone' } });
      expect(component.emailSelected).toBe(false);
      expect(component.addressSelected).toBe(false);
      expect(component.phoneSelected).toBe(true);
      component.mediumForm.controls['telephoneNumber'].setValue('');
      component.mediumForm.controls['telephoneNumber'].updateValueAndValidity();
      expect(component.mediumForm.controls['telephoneNumber'].invalid).toBe(true); // required
    });

    it('isValidFilename should validate correctly', () => {
      expect(component.isValidFilename('valid_name-123.png')).toBe(true);
      expect(component.isValidFilename('invalid name!.png')).toBe(false);
      expect(component.isValidFilename('another.invalid/char')).toBe(false);
    });

    it('addBold should append bold markdown to description', () => {
      component.profileForm.controls['description'].setValue('start');
      component.addBold();
      expect(component.profileForm.controls['description'].value).toContain('**bold text**');
    });

    it('loadProfileData should populate form and contactmediums and image preview', () => {
      const sampleProfile: any = {
        tradingName: 'My Org',
        contactMedium: [
          { mediumType: 'Email', preferred: true, characteristic: { contactType: 'Email', emailAddress: 'a@b.com' } },
          { mediumType: 'PostalAddress', preferred: false, characteristic: { city: 'City', country: 'GB', postCode: 'PC1', stateOrProvince: 'State', street1: 'Street 1' } },
          { mediumType: 'TelephoneNumber', preferred: false, characteristic: { contactType: 'Mobile', phoneNumber: '+441234567890' } }
        ],
        partyCharacteristic: [
          { name: 'logo', value: 'https://example.com/logo.png' },
          { name: 'description', value: 'Org description' },
          { name: 'website', value: 'https://org.example' },
          { name: 'country', value: 'GB' }
        ]
      };
      component.loadProfileData(sampleProfile);
      expect(component.profileForm.controls['name'].value).toBe('My Org');
      expect(component.contactmediums.length).toBeGreaterThanOrEqual(3);
      expect(component.imgPreview).toContain('https://example.com/logo.png');
      expect(component.profileForm.controls['description'].value).toBe('Org description');
      expect(component.profileForm.controls['website'].value).toBe('https://org.example');
      expect(component.profileForm.controls['country'].value).toBe('GB');
    });

    it('updateProfile should call accountService.updateOrgInfo and show successVisibility', () => {
      component.profileForm.controls['name'].setValue('Test Org');
      component.contactmediums = [];
      const spy = jest.spyOn(accountService, 'updateOrgInfo').mockReturnValue(of({ result: 'ok' }));
      component.updateProfile();
      expect(spy).toHaveBeenCalled();
      expect(component.successVisibility).toBe(true);
    });

  });
});
