import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import {LocalStorageService} from "../services/local-storage.service";
import { Observable } from 'rxjs';
import { LoginInfo } from '../models/interfaces';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {

  constructor(private readonly localStorage: LocalStorageService, private readonly router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    let aux = this.localStorage.getObject('login_items') as LoginInfo;
    const requiredRoles = route.data['roles'] as Array<string>;
    const isIsbe = route.data['is_isbe'] as boolean;
    let userRoles: string | any[] = [];

    if(JSON.stringify(aux) != '{}' && (((aux.expire - moment().unix())-4) > 0)) {
      if(aux.logged_as == aux.id){
        userRoles.push('individual')
        for(const element of aux.roles){
          userRoles.push(element.name)
        }
      } else {
        let loggedOrg = aux.organizations.find((element: { id: any; }) => element.id == aux.logged_as)
        for(const element of loggedOrg.roles){
          userRoles.push(element.name)
        }
      }
    } else {
      this.router.navigate(['/dashboard']);
      return false;
    }

    if (requiredRoles.length != 0) {
      const hasRequiredRoles = requiredRoles.some(role => userRoles.includes(role));

      if (!hasRequiredRoles) {
        this.router.navigate(['/dashboard']);  // Navigate to an access denied page or login page
        return false;
      }
    }

    if (isIsbe) {
      this.router.navigate(['/dashboard']);  // Navigate to an access denied page or login page
      return false;
    }
    
    return true;
  }
}
