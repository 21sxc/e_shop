import Vue from 'vue'
import Router from 'vue-router'

const Login = () => import(/* webpackChunkName: "login_home_welome" */ './components/Login.vue')
const Welcome = () => import(/* webpackChunkName: "login_home_welome" */ './components/Welcome.vue')
const Home = () => import(/* webpackChunkName: "login_home_welome" */ './components/Home.vue')

const Users = () => import(/* webpackChunkName: "users_power" */ './components/user/Users.vue')
const Rights = () => import(/* webpackChunkName: "users_power" */ './components/power/Rights.vue')
const Roles = () => import(/* webpackChunkName: "users_power" */ './components/power/Roles.vue')

const Cate = () => import(/* webpackChunkName: "cate_params" */ './components/goods/Cate.vue')
const Params = () => import(/* webpackChunkName: "cate_params" */ './components/goods/Params.vue')

const GoodsList = () => import(/* webpackChunkName: "list_add" */ './components/goods/List.vue')
const Add = () => import(/* webpackChunkName: "list_add" */ './components/goods/Add.vue')

const Order = () => import(/* webpackChunkName: "order_report" */ './components/order/Order.vue')
const Report = () => import(/* webpackChunkName: "order_report" */ './components/report/Report.vue')


Vue.use(Router)

const router = new Router({
	routes: [
		{ path: '/', redirect: '/login' },
		{ path: '/login', component: Login },
		{ path: '/home', component: Home,
			redirect:'/welcome',
			children:[{ path:'/welcome', component:Welcome },
								{ path:'/users', component:Users },
								{ path:'/rights', component:Rights },
								{ path:'/roles', component:Roles },
								{ path:'/categories', component:Cate },
								{ path:'/params', component:Params },
								{ path:'/goods', component:GoodsList },
								{ path:'/goods/add', component:Add },
								{ path:'/orders', component:Order },
								{ path:'/reports', component:Report },
		]
	},
	]
})

//挂载路由导航函数
router.beforeEach((to, from, next) => {
	//to 将要访问的路径
	//from 代表从哪个函数跳转而来
	//next 是一个函数，表示放行
	// next() next('/login') 强制跳转

	if (to.path === '/login') return next();
	//获取token
	const tokenStr = window.sessionStorage.getItem('token')
	if (!tokenStr) return next('/login')
	next()
})

export default router