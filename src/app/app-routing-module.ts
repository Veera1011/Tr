import { NgModule } from '@angular/core';
import { NoPreloading, PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { Register } from './auth/register/register';
import { authGuard } from './auth/auth-guard';
import { Home } from './home/home';
import { OauthCallback } from './auth/oauth-callback/oauth-callback';
import { Dashboard } from './dashboard/dashboard';

const routes: Routes = [
  {path:'',component:Home},
  {path:'login',component:Login},
  {path:'register',component:Register},
  { path: 'auth/callback', component: OauthCallback },
  {path:'dashboard',component:Dashboard, canActivate:[authGuard]},
  {path:'traineem',canActivate:[authGuard],loadChildren:()=>import('./trainee/trainee-module').then(m => m.TraineeModule)},
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{preloadingStrategy:NoPreloading})],
  exports: [RouterModule]
})
export class AppRoutingModule { }