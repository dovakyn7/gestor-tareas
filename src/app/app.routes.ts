import { Routes } from '@angular/router';
//import { AdminComponent } from './admin/admin';
import { BoardComponent } from './board/board';
import { AdminComponent } from './admin/admin';

export const routes: Routes = [

    { path: '', component:BoardComponent },
   // { path: 'AdminComponent', component:Admin },
    { path: 'admin', component: AdminComponent },
    { path: '**', redirectTo: '' }
    
];
