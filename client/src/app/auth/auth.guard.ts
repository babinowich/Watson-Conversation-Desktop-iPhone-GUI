import { Injectable, Inject } from '@angular/core'
import { Router, Route, CanActivate, CanLoad, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'

import { throwError as observableThrowError,  Observable } from 'rxjs'

import { LoopbackAuthService } from './loopback/loopback-auth.service'

@Injectable()
export class AuthGuard implements CanActivate, CanLoad {

  constructor(private router: Router, private authService: LoopbackAuthService) { }

  // Use this function when you want to allow a route to be access only when the user is authenticated
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    return this.authService.isAuthenticated().pipe(resp => {
      console.log(resp ? 'User is authenticated.' : 'User is NOT authenticated.')
      return resp
    })
  }

  // Use this function when a module should be loaded via lazy loading only when a user is authenticated
  canLoad(route: Route): Observable<boolean> | boolean {
    return this.authService.isAuthenticated().pipe(resp => {
      console.log(resp ? 'User is authenticated.' : 'User is NOT authenticated.')
      return resp
    })
  }
}
