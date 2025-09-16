import { Component, Input } from '@angular/core';
import {Category} from "../../models/interfaces";
import {EventMessageService} from "src/app/services/event-message.service";
import { DatePipe } from '@angular/common';

@Component({
    selector: 'categories-recursion',
    templateUrl: './categories-recursion.component.html',
    styleUrl: './categories-recursion.component.css',
    standalone: true,
    imports: [DatePipe]
})
export class CategoriesRecursionComponent {
  @Input() child: Category;
  @Input() parent: Category;
  @Input() selected: Category[];
  @Input() path: string;

  constructor(
    private readonly eventMessage: EventMessageService,
  ) {

  }

  isCategorySelected(cat:any){
    if(this.selected!=undefined){
      const index = this.selected.findIndex(item => item.id === cat.id);
      if (index !== -1) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  addCategory(cat:any){
    this.eventMessage.emitCategoryAdded(cat);
  }

}
