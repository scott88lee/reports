import Vue from 'vue'
import Router from 'vue-router'
import Transactions from './views/Transactions.vue'
import Login from './views/Login.vue'; // path to login.vue
import Logout from './views/Logout.vue';
import Auth from './views/Auth.vue'; // path to auth.vue


Vue.use(Router)

export default new Router({
  routes: [{
      path: '/',
      name: 'home',
      component: Transactions
    },
    {
      path: '/login',
      component: Login,
      name: 'login',
    },
    {
      path: '/logout',
      component: Logout,
      name: 'logout',
    },
    {
      path: '/auth',
      component: Auth,
      name: 'auth',
    },
    {
      path: '/transactions',
      name: 'Transactions',
      component: Transactions
    },
    {
      path: '/funding',
      name: 'funding',
      component: () => import( /* webpackChunkName: "Funding" */ './views/Funding.vue')
    },
    {
      path: '/billing',
      name: 'billing',
      component: () => import( /* webpackChunkName: "Billing" */ './views/Billing.vue')
    },
    {
      path: '/deep',
      name: 'deep',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import( /* webpackChunkName: "Deep" */ './views/Deep.vue')
    },
    {
      path: '/tools',
      name: 'DevTools',
      component: () => import( /* webpackChunkName: "Deep" */ './views/DevTools.vue')
    }
  ]
})