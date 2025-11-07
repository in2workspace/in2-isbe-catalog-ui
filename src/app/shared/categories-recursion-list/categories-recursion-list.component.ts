import { Component, Input } from '@angular/core';
import {Category} from "../../models/interfaces";
import {EventMessageService} from "src/app/services/event-message.service";
import { DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'categories-recursion-list',
    templateUrl: './categories-recursion-list.component.html',
    styleUrl: './categories-recursion-list.component.css',
    standalone: true,
    imports: [DatePipe, TranslateModule]
})
export class CategoriesRecursionListComponent {
  @Input() child: Category;
  @Input() parent: Category;
  @Input() path: string;

  constructor(
    private eventMessage: EventMessageService,
  ) {
    
  }

  addCategory(cat:any){
    this.eventMessage.emitCategoryAdded(cat);
  }

  goToUpdate(cat:any){
    this.eventMessage.emitUpdateCategory(cat);
  }

}