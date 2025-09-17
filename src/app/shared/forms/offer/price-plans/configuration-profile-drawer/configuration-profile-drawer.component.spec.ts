import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { ConfigurationProfileDrawerComponent } from './configuration-profile-drawer.component';
import { TranslateModule } from '@ngx-translate/core';

describe('ConfigurationProfileDrawerComponent', () => {
  let component: ConfigurationProfileDrawerComponent;
  let fixture: ComponentFixture<ConfigurationProfileDrawerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigurationProfileDrawerComponent, TranslateModule.forRoot()]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfigurationProfileDrawerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
