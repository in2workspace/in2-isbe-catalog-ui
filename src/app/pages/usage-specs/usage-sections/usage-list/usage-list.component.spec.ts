import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { UsageListComponent } from './usage-list.component';
import { TranslateModule } from '@ngx-translate/core';

describe('UsageListComponent', () => {
  let component: UsageListComponent;
  let fixture: ComponentFixture<UsageListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsageListComponent,HttpClientTestingModule,TranslateModule.forRoot()]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UsageListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
