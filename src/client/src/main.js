import Vue from 'vue'
import App from './App.vue'
import Vuex from 'vuex'
import Router from 'vue-router'
import Login from './components/Pages/LoginPage'
import Dashboard from './components/Pages/DashboardPage'
import Register from './components/Pages/RegisterPage'
import 'bootstrap-css-only/css/bootstrap.min.css'
import 'mdbvue/lib/css/mdb.min.css'
import '@fortawesome/fontawesome-free/css/all.min.css'

Vue.config.productionTip = false

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      redirect: {
        name: 'Login'
      }
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: Dashboard,
      beforeEnter: (to, from, next) => {
        if(store.state.authenticated == false) {
          next('/login')
        } else {
          next()
        }
      }
    },
    {
      path: '/register',
      name: 'Register',
      component: Register
    }
  ]
})


// Setup store with vuex
Vue.use(Vuex)
export const store = new Vuex.Store(
  {
    state: {
      authenticated: false
    },
    mutations: {
      setAuthentication(state, status) {
        state.authenticated = status;
      }
    }
  }
)

new Vue({
  render: h => h(App),
  store: store,
  router: router
}).$mount('#app')
