import Vue from 'vue'
import Router from 'vue-router'
import Message from '@/components/Message'
import Login from '@/components/Login'
import Reg from '@/components/Reg'

Vue.use(Router)

const router = new Router({
    routes: [{
        path: '*', //除了已经配置好路由
        redirect: '/login'
    }, {
        path: '/message',
        name: 'message',
        meta: { requireAuth: true },
        component: Message
    }, {
        path: '/login',
        name: 'login',
        component: Login
    }, {
        path: '/reg',
        name: 'reg',
        component: Reg
    }, ],
    mode: 'history',
})

router.beforeEach((to, from, next) => {

    let userData = JSON.parse(localStorage.getItem('userData'))

    if (to.meta.requireAuth) {
        if (!!!userData) {
            next({
                path: '/login',
                query: { redirect: to.fullPath }
            })
        } else {
            next();
        }

    } else {
        next();
    }
});

export default router