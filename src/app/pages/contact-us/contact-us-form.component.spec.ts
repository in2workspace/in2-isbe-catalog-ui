import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { ContactUsFormComponent } from './contact-us-form.component';
import { TranslateModule } from '@ngx-translate/core';

describe('ContactUsFormComponent', () => {
  let component: ContactUsFormComponent;
  let fixture: ComponentFixture<ContactUsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [ContactUsFormComponent, TranslateModule.forRoot()]
})
    .compileComponents();
    
    fixture = TestBed.createComponent(ContactUsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
