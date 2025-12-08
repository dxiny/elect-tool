import { defineStore } from 'pinia'

export const useMenuStore = defineStore('menu', {
  state: () => ({
    menu: [
      { id: 'home', title: '首页', path: '/', icon: 'HomeFilled' },
      { id: 'ai', title: 'AI', path: '/ai', icon: 'Cpu' },
      { id: 'json', title: 'JSON', path: '/json', icon: 'Document' }
    ]
  })
})
