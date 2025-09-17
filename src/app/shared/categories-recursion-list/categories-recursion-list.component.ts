import { Component, Input } from '@angular/core';
import {Category} from "../../models/interfaces";
import {EventMessageService} from "src/app/services/event-message.service";
import { DatePipe } from '@angular/common';

@Component({
    selector: 'categories-recursion-list',
    templateUrl: './categories-recursion-list.component.html',
    styleUrl: './categories-recursion-list.component.css',
    standalone: true,
    imports: [DatePipe]
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