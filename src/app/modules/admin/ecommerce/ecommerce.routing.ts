import { Route } from '@angular/router';
import {CategoryComponent} from "./Category/category.component";
import {ItemsComponent} from "./items/items.component";


export const ecommerceRoutes: Route[] = [

    {
        path     : 'category',
        component: CategoryComponent
    },
    {
        path     : 'items/:categoryId',
        component: ItemsComponent
    }
];
