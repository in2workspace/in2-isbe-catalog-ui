import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {EventMessageService} from "src/app/services/event-message.service";
import { UsageServiceService } from 'src/app/services/usage-service.service';
import { PaginationService } from 'src/app/services/pagination.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/guard/auth.service';
import { take } from 'rxjs';

@Component({
  selector: 'usage-list',
  standalone: true,
  imports: [TranslateModule, FontAwesomeModule, CommonModule],
  templateUrl: './usage-list.component.html',
  styleUrl: './usage-list.component.css'
})
export class UsageListComponent  implements OnInit {
  usageSpecs:any[]=[];
  nextUsageSpecs:any[]=[];
  loading:boolean=false;
  loading_more:boolean=false;
  seller:any='';
  page:number=0;
  page_check:boolean = true;
  USAGE_SPEC_LIMIT: number = environment.USAGE_SPEC_LIMIT;

  constructor(
    private readonly eventMessage: EventMessageService,
    private readonly usageService: UsageServiceService,
    private readonly paginationService: PaginationService,
    private readonly auth: AuthService
  ) {
  }

  async ngOnInit() {
    this.initPartyInfo();
    this.loading=true;
    await this.getUsageSpecs(false);
  }

  initPartyInfo(){
   this.auth.sellerId$
    .pipe(take(1))
    .subscribe(id => {
      this.seller = id || '';
    });
  }

  async getUsageSpecs(next:boolean){
    if(!next){
      this.loading=true;
    }
    
    let options = {
      "seller": "did:elsi:"+this.seller
    }
    
    this.paginationService.getItemsPaginated(this.page, this.USAGE_SPEC_LIMIT, next, this.usageSpecs,this.nextUsageSpecs, options,
      this.usageService.getUsageSpecs.bind(this.usageService)).then(data => {
      this.page_check=data.page_check;      
      this.usageSpecs=data.items;
      this.nextUsageSpecs=data.nextItems;
      this.page=data.page;
      this.loading=false;
      this.loading_more=false;
    })
  }

  async next(){
    await this.getUsageSpecs(true);
  }

  goToCreate(){
    this.eventMessage.emitCreateUsageSpec(true);
  }

  goToUpdate(usageSpec:any){
    this.eventMessage.emitUpdateUsageSpec(usageSpec);
  }

}
