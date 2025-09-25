import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class GlobalDataService {
  private readonly tokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(
    localStorage.getItem('userToken') ?? ''
  );
  
  getToken(): Observable<string> {
    return this.tokenSubject.asObservable();
  }

  setToken(token: string): void {
    localStorage.setItem('userToken', token);
    this.tokenSubject.next(token);
  }

  clearToken(): void {
    localStorage.removeItem('userToken');
    this.tokenSubject.next('');
  }

  getTokenValue(): string {
    return this.tokenSubject.value;
  }

  isTokenValid() {
    let params = new HttpParams();
  }

}
