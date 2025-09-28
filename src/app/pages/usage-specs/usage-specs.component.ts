import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {EventMessageService} from "src/app/services/event-message.service";
import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { UsageListComponent } from "src/app/pages/usage-specs/usage-sections/usage-list/usage-list.component"
import { UsageSpecComponent } from "src/app/shared/forms/usage-spec/usage-spec.component"
import { CreateUsageSpecComponent } from "./usage-sections/create-usage-spec/create-usage-spec.component"
import { UpdateUsageSpecComponent } from './usage-sections/update-usage-spec/update-usage-spec.component'
import { take } from 'rxjs';
import { AuthService } from 'src/app/guard/auth.service';

@Component({
  selector: 'app-usage-specs',
  standalone: true,
  imports: [
    TranslateModule,
    FontAwesomeModule,
    CommonModule,
    UsageListComponent,
    UsageSpecComponent,
    CreateUsageSpecComponent,
    UpdateUsageSpecComponent
  ],
  providers: [DatePipe],
  templateUrl: './usage-specs.component.html',
  styleUrl: './usage-specs.component.css'
})
export class UsageSpecsComponent implements OnInit {

  userInfo:any;
  show_usage_specs:boolean=true;
  show_create_usage:boolean=false;
  show_update_usage:boolean=false;
  usageSpecToUpdate:any;

  constructor(
    private auth: AuthService,
    private eventMessage: EventMessageService
  ) {
    this.eventMessage.messages$.subscribe(ev => {
      if(ev.type === 'UsageSpecList' && ev.value == true) {        
        this.goToUsageSpec();
      } else if(ev.type === 'UpdateUsageSpec' && ev.value) {  
        this.show_update_usage=true;
        this.show_usage_specs=false;
        this.show_create_usage=false;
        this.usageSpecToUpdate=ev.value;
      } else if(ev.type === 'CreateUsageSpec' && ev.value == true) {  
        this.show_create_usage=true;
        this.show_update_usage=false;
        this.show_usage_specs=false;
      }
    })
  }

  ngOnInit(): void {
    this.auth.loginInfo$
    .pipe(take(1))
    .subscribe(li => {
      this.userInfo = li ?? null;
    });
  }

  goToUsageSpec(){
    this.show_update_usage=false;
    this.show_usage_specs=true;
    this.show_create_usage=false;
  }

  removeClass(elem: HTMLElement, cls:string) {
    var str = " " + elem.className + " ";
    elem.className = str.replace(" " + cls + " ", " ").replace(/^\s+|\s+$/g, "");
  }

  addClass(elem: HTMLElement, cls:string) {
      elem.className += (" " + cls);
  }

  unselectMenu(elem:HTMLElement | null,cls:string){
    if(elem != null){
      if(elem.className.match(cls)){
        this.removeClass(elem,cls)
      } else {
        console.log('already unselected')
      }
    }
  }

  selectMenu(elem:HTMLElement| null,cls:string){
    if(elem != null){
      if(elem.className.match(cls)){
        console.log('already selected')
      } else {
        this.addClass(elem,cls)
      }
    }
  }

}
