import { defineStore } from 'pinia'

export const useMenuStore = defineStore('menu', {
  state: () => ({
    menu: [
      { id: 'ai', title: 'AI', path: '/ai', icon: 'RobotOutlined' },
      { id: 'gis', title: 'GIS', path: '/gis', icon: 'GlobalOutlined' },
      { id: 'home', title: '主页', path: '/', icon: 'HomeOutlined' },
      { id: '3d', title: '3D', path: '/3d', icon: 'CodeSandboxOutlined' },
      { id: 'tools', title: '工具', path: '/tools', icon: 'ToolOutlined' }
    ]
  })
})
