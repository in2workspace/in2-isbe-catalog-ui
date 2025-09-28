import { Component, OnInit, Input } from '@angular/core';
import { UsageSpecComponent } from 'src/app/shared/forms/usage-spec/usage-spec.component'
import { ReactiveFormsModule } from "@angular/forms";
import {TranslateModule} from "@ngx-translate/core";
import {NgClass} from "@angular/common";
import { take } from 'rxjs';
import {EventMessageService} from "src/app/services/event-message.service";
import { AuthService } from 'src/app/guard/auth.service';

@Component({
  selector: 'update-usage-spec',
  standalone: true,
  imports: [
    UsageSpecComponent,
    TranslateModule,
    ReactiveFormsModule,
    NgClass
  ],
  templateUrl: './update-usage-spec.component.html',
  styleUrl: './update-usage-spec.component.css'
})
export class UpdateUsageSpecComponent implements OnInit {
  seller:any='';
  @Input() usageSpec: any;

  constructor(
    private readonly auth: AuthService,
    private readonly eventMessage: EventMessageService,
  ){}

  ngOnInit() {
    this.initPartyInfo();
  }

  initPartyInfo(){
   this.auth.sellerId$
    .pipe(take(1))
    .subscribe(id => {
      this.seller = id || '';
    });
  }

  goBack() {
    this.eventMessage.emitUsageSpecList(true);
  }
}
