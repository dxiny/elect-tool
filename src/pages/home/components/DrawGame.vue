<template>
  <div class="game-wrapper">
    <h1>你画我猜</h1>
    <p class="subtitle">多人实时画板，发挥你的想象力！</p>

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
import { Socket } from 'socket.io-client'

const props = defineProps<{
  socketInstance: Socket | null
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const isDrawing = ref(false)
const currentColor = ref('#000000')
const colors = [
  '#000000',
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#FF00FF',
  '#00FFFF',
  '#FFFFFF'
]
let ctx: CanvasRenderingContext2D | null = null

onMounted(() => {
  // Init Canvas
  setTimeout(() => {
    if (canvasRef.value) {
      ctx = canvasRef.value.getContext('2d')
      if (ctx) {
        ctx.lineWidth = 3
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
      }
    }
  }, 100)

  // Socket Listeners
  if (props.socketInstance) {
    props.socketInstance.on('draw-start', (data: any) => {
      if (!ctx) return
      ctx.beginPath()
      ctx.moveTo(data.x, data.y)
      ctx.strokeStyle = data.color
    })

    props.socketInstance.on('draw-move', (data: any) => {
      if (!ctx) return
      ctx.lineTo(data.x, data.y)
      ctx.stroke()
    })

    props.socketInstance.on('draw-end', () => {
      if (!ctx) return
      ctx.closePath()
    })

    props.socketInstance.on('clear-canvas', () => {
      if (!ctx || !canvasRef.value) return
      ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
    })
  }
})

const startDrawing = (e: MouseEvent) => {
  if (!ctx) return
  isDrawing.value = true
  const { offsetX, offsetY } = e

  ctx.beginPath()
  ctx.moveTo(offsetX, offsetY)
  ctx.strokeStyle = currentColor.value

  props.socketInstance?.emit('draw-start', { x: offsetX, y: offsetY, color: currentColor.value })
}

const draw = (e: MouseEvent) => {
  if (!isDrawing.value || !ctx) return
  const { offsetX, offsetY } = e

  ctx.lineTo(offsetX, offsetY)
  ctx.stroke()

  props.socketInstance?.emit('draw-move', { x: offsetX, y: offsetY })
}

const stopDrawing = () => {
  if (!isDrawing.value || !ctx) return
  isDrawing.value = false
  ctx.closePath()
  props.socketInstance?.emit('draw-end')
}

const clearCanvas = () => {
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
