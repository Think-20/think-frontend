import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from "@angular/common/http";
import { Observable } from "rxjs";
import { User } from "app/user/user.model";

export class AddHeaderInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // IGNORA APIs EXTERNAS
    if (req.url.includes('viacep.com.br')) {
      return next.handle(req);
    }

    let user = JSON.parse(localStorage.getItem('currentUser')) || new User();
    let token = localStorage.getItem('token') || '';

    let headers = req.headers
      .set('Authorization', `${token}`)
      .set('User', `${user.id}`);

    if (req.url.indexOf('upload-file') === -1) {

      if (!(req.body instanceof FormData)) {
        headers = headers.set('Content-Type', 'application/json');
      }

    } else {

    }

    return next.handle(req.clone({ headers }));
  }
}