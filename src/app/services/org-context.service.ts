import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OrgContextService {
  private readonly org$ = new BehaviorSubject<string | null>(null);

  setOrganization(id: string | null) {
    this.org$.next(id);
  }

  getOrganization(): Observable<string | null> {
    return this.org$.asObservable();
  }

  get current(): string | null {
    return this.org$.getValue();
  }
}
