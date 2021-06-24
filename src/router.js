import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)
const routes = [
    { path: '/404', redirect: '/' }, //重定项
    {
        path: '/',
        name: 'hello',
        component: require('./views/Hello.vue').default,
    },
]
const router = new VueRouter({
    base: '/',
    mode: 'history',
    routes
})
export default router
