<template>
  <div class="game-wrapper">
    <h1>你画我猜</h1>
    <p class="subtitle">多人实时画板，发挥你的想象力！</p>

    <!-- 绘图区域 -->
    <div class="game-area draw-area">
      <canvas
        ref="canvasRef"
        width="800"
        height="500"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
      ></canvas>
    </div>

    <!-- 控制区域：颜色选择与清空 -->
    <div class="controls">
      <div class="colors">
        <div
          v-for="color in colors"
          :key="color"
          class="color-swatch"
          :style="{ backgroundColor: color }"
          :class="{ active: currentColor === color }"
          @click="currentColor = color"
        ></div>
      </div>
      <a-button type="primary" danger @click="clearCanvas">清空画布</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 接收父组件传递的 Socket 实例
const props = defineProps<{
  socketInstance: any
}>()

// Canvas 引用与绘图状态
const canvasRef = ref<HTMLCanvasElement | null>(null)
const isDrawing = ref(false)
const currentColor = ref('#000000') // 默认黑色

// 可选颜色列表
const colors = [
  '#000000', // 黑
  '#FF0000', // 红
  '#00FF00', // 绿
  '#0000FF', // 蓝
  '#FFFF00', // 黄
  '#FF00FF', // 紫
  '#00FFFF', // 青
  '#FFFFFF'  // 白（橡皮擦效果）
]
// Canvas 上下文
let ctx: CanvasRenderingContext2D | null = null

onMounted(() => {
  // 初始化 Canvas 上下文
  // 使用 setTimeout 确保 DOM 已经渲染完成
  setTimeout(() => {
    if (canvasRef.value) {
      ctx = canvasRef.value.getContext('2d')
      if (ctx) {
        ctx.lineWidth = 3       // 线条宽度
        ctx.lineCap = 'round'   // 线条末端圆角
        ctx.lineJoin = 'round'  // 线条连接处圆角
      }
    }
  }, 100)

  // 监听 Socket 事件（远程绘图同步）
  if (props.socketInstance) {
    // 收到开始绘图事件
    props.socketInstance.on('draw-start', (data: any) => {
      if (!ctx) return
      ctx.beginPath()
      ctx.moveTo(data.x, data.y)
      ctx.strokeStyle = data.color
    })

    // 收到绘图移动事件
    props.socketInstance.on('draw-move', (data: any) => {
      if (!ctx) return
      ctx.lineTo(data.x, data.y)
      ctx.stroke()
    })

    // 收到结束绘图事件
    props.socketInstance.on('draw-end', () => {
      if (!ctx) return
      ctx.closePath()
    })

    // 收到清空画布事件
    props.socketInstance.on('clear-canvas', () => {
      if (!ctx || !canvasRef.value) return
      ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
    })
  }
})

// 开始绘图（鼠标按下）
const startDrawing = (e: MouseEvent) => {
  if (!ctx) return
  isDrawing.value = true
  const { offsetX, offsetY } = e

  // 本地绘图
  ctx.beginPath()
  ctx.moveTo(offsetX, offsetY)
  ctx.strokeStyle = currentColor.value

  // 发送事件给服务器
  props.socketInstance?.emit('draw-start', { x: offsetX, y: offsetY, color: currentColor.value })
}

// 绘制过程（鼠标移动）
const draw = (e: MouseEvent) => {
  if (!isDrawing.value || !ctx) return
  const { offsetX, offsetY } = e

  // 本地绘图
  ctx.lineTo(offsetX, offsetY)
  ctx.stroke()

  // 发送事件给服务器
  props.socketInstance?.emit('draw-move', { x: offsetX, y: offsetY })
}

// 结束绘图（鼠标松开或离开画布）
const stopDrawing = () => {
  if (!isDrawing.value || !ctx) return
  isDrawing.value = false
  ctx.closePath()
  
  // 发送事件给服务器
  props.socketInstance?.emit('draw-end')
}

// 清空画布
const clearCanvas = () => {
  // 发送清空事件（服务器会广播给所有客户端执行清空操作）
  props.socketInstance?.emit('clear-canvas')
}
</script>

<style scoped>
.game-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.subtitle {
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.game-area {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.draw-area {
  border: 2px solid var(--border-color-base);
  cursor: crosshair;
  overflow: hidden;
}

.controls {
  display: flex;
  align-items: center;
  gap: 24px;
  background: var(--sidebar-bg);
  padding: 16px 32px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.colors {
  display: flex;
  gap: 8px;
}

.color-swatch {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: transform 0.2s;
}

.color-swatch:hover {
  transform: scale(1.2);
}

.color-swatch.active {
  border-color: var(--brand-primary);
  transform: scale(1.2);
}
</style>
