import { Routes } from '@angular/router';
import { Home } from './Pages/home/home';
import { Login } from './Pages/login/login';
import { ProductList } from './Pages/product-list/product-list';

export const routes: Routes = [

    {
        path:'',
        redirectTo:'home',
        pathMatch:'full'

    },
    {
        path:'home',
        component: Home
    },
    {
        path:'login',
        component: Login
    },
    {
        path:'products',
        component: ProductList
    }


];
