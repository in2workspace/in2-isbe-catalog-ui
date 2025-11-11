import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { PublishServiceComponent } from './publish-service.component';
import { TranslateModule } from '@ngx-translate/core';

describe('PublishServiceComponent', () => {
  let component: PublishServiceComponent;
  let fixture: ComponentFixture<PublishServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublishServiceComponent,TranslateModule.forRoot()]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PublishServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
