import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/pages/home/index.vue'
import About from '@/pages/about/Index.vue'
import Profile from '@/pages/profile/Index.vue'
import AIIndex from '@/pages/ai/Index.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '主页' }
  },
  {
    path: '/ai',
    name: 'AI',
    component: AIIndex,
    meta: { title: 'AI' }
  },
  {
    path: '/gis',
    name: 'GIS',
    component: Home, // Placeholder
    meta: { title: 'GIS' }
  },
  {
    path: '/3d',
    name: '3D',
    component: Home, // Placeholder
    meta: { title: '3D' }
  },
  {
    path: '/tools',
    name: 'Tools',
    component: Home, // Placeholder
    meta: { title: '工具' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { title: '个人资料' }
  },
  {
    path: '/about',
    name: 'About',
    component: About
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
