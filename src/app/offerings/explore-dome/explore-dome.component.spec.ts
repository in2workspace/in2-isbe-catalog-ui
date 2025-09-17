import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { ExploreDomeComponent } from './explore-dome.component';
import { TranslateModule } from '@ngx-translate/core';

describe('ExploreDomeComponent', () => {
  let component: ExploreDomeComponent;
  let fixture: ComponentFixture<ExploreDomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExploreDomeComponent, TranslateModule.forRoot()],
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExploreDomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
