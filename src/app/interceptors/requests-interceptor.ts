import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { OrgContextService } from '../services/org-context.service';

@Injectable()
export class OrgAndTermsInterceptor implements HttpInterceptor {
  public static readonly BASE_URL: string = environment.BASE_URL;
  public static readonly API_ORDERING: string = environment.PRODUCT_ORDER;
  public static readonly ORDER_LIMIT: number = environment.ORDER_LIMIT;

  constructor(private readonly orgCtx: OrgContextService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let headers: Record<string, string> = {};

    const org = this.orgCtx.current;
    if (org) {
      headers['X-Organization'] = org;
    }

    const isOrderingEndpoint = request.url.startsWith(
      `${OrgAndTermsInterceptor.BASE_URL}${OrgAndTermsInterceptor.API_ORDERING}/productOrder`
    );
    if (isOrderingEndpoint) {
      headers['X-Terms-Accepted'] = 'true';
    }

    if (Object.keys(headers).length === 0) {
      return next.handle(request);
    }

    const modified = request.clone({ setHeaders: headers });
    return next.handle(modified);
  }
}
