import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/pages/home/index.vue'
import AIIndex from '@/pages/ai/Index.vue'
import GisIndex from '@/pages/gis/Index.vue'
import ToolsIndex from '@/pages/tools/Index.vue'
import Profile from '@/pages/profile/Index.vue'

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
    meta: { title: 'AI', noPadding: true }
  },
  {
    path: '/gis',
    name: 'GIS',
    component: GisIndex,
    meta: { title: 'GIS', noPadding: true }
  },
  {
    path: '/3d',
    name: '3D',
    component: Home,
    meta: { title: '3D' }
  },
  {
    path: '/tools',
    name: 'Tools',
    component: ToolsIndex,
    meta: { title: '工具' }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { title: '个人资料' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
