import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/pages/home/index.vue'
import Markdown from '@/pages/editor/Markdown.vue'
import Charts from '@/pages/charts/Index.vue'
import About from '@/pages/about/Index.vue'
import Profile from '@/pages/profile/Index.vue'
import AIIndex from '@/pages/ai/Index.vue'
import JSONIndex from '@/pages/json/Index.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '首页' }
  },
  {
    path: '/ai',
    name: 'AIIndex',
    component: AIIndex,
    meta: { title: 'AI模型' }
  },
  {
    path: '/json',
    name: 'JSONIndex',
    component: JSONIndex,
    meta: { title: 'JSON转换' }
  },
  {
    path: '/editor/markdown',
    name: 'Markdown',
    component: Markdown,
    meta: { title: 'markdown编辑器' }
  },
  {
    path: '/charts',
    name: 'Charts',
    component: Charts
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
