import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import SSO from '@reddotpay/rdp-sso';
import Vuelidate from 'vuelidate';

Vue.use(Vuelidate);
Vue.config.productionTip = false

Object.defineProperty(Vue.prototype, '$sso', { value: SSO });

router.beforeEach((to, from, next) => {
  if (window.location.pathname.length >= 2) {
    window.location = `${window.location.origin}/#${window.location.pathname}${window.location.search}`;
  }
  $(() => {
    $('.ui.segment, .ui.table').transition('fade down in');
  });
  SSO.init(to, from, router);
  next();
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
