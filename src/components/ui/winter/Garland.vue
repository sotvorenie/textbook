<script setup lang="ts">
import {ref, onMounted, onUnmounted, watch} from 'vue';

import useUIStore from "../../../store/useUIStore.ts";
const uiStore = useUIStore();

const canvasRef = ref<HTMLCanvasElement | null>(null)
const ctx = ref<CanvasRenderingContext2D | null>(null)
let animationId: number

let NUM_LAMPS = Math.floor(window.innerWidth / 60)
const W_POINTS = 4 // 3 сегмента провисания
const ropeOffsetTop = 5 // Почти вплотную к верху
const maxSag = 30 // Максимальное провисание в пикселях

const sags = Array.from({ length: W_POINTS - 1 }, () => 15 + Math.random() * (maxSag - 15))

interface Lamp {
  x: number;
  phase: number;
  hue: number;
  pulsePhase: number;
}

const lamps = ref<Lamp[]>([])
let width = 0
let height = 0

const isAnimating = ref(false)

const toggleColor = () => {
  isAnimating.value = true

  setTimeout(() => {
    isAnimating.value = false
  }, 400)
}

const getRopeY = (x: number) => {
  const step = width / (W_POINTS - 1)
  for (let i = 0; i < W_POINTS - 1; i++) {
    const x0 = i * step
    const x1 = (i + 1) * step
    if (x >= x0 && x <= x1) {
      const t = (x - x0) / (x1 - x0)
      return ropeOffsetTop + sags[i] * Math.sin(t * Math.PI)
    }
  }
  return ropeOffsetTop
}

const initLamps = () => {
  lamps.value = []
  for (let i = 0; i < NUM_LAMPS; i++) {
    const x = (i + 0.5) * (width / NUM_LAMPS)
    lamps.value.push({
      x,
      phase: Math.random() * Math.PI * 2,
      hue: Math.floor(Math.random() * 360),
      pulsePhase: Math.random() * Math.PI * 2
    })
  }
}

const drawRope = () => {
  if (!ctx.value) return
  ctx.value.strokeStyle = '#eee'
  ctx.value.lineWidth = 1
  ctx.value.beginPath()
  ctx.value.moveTo(0, getRopeY(0))
  for (let x = 0; x <= width; x += 2) {
    ctx.value.lineTo(x, getRopeY(x))
  }
  ctx.value.stroke()
}

const drawLamp = (lamp: Lamp) => {
  if (!ctx.value) return

  const now = Date.now()
  const startX = lamp.x
  const startY = getRopeY(lamp.x)

  const angle = Math.sin(now * 0.0012 + lamp.phase) * 0.1

  ctx.value.save()
  ctx.value.translate(startX, startY)
  ctx.value.rotate(angle)

  let color = 'rgba(200, 200, 200, 0.3)'
  if (uiStore.garlandIsActive) {
    const lightness = 75 + Math.sin(now * 0.003 + lamp.pulsePhase) * 15
    color = `hsl(${lamp.hue}, 100%, ${lightness}%)`
    ctx.value.shadowBlur = 15
    ctx.value.shadowColor = color
  }

  ctx.value.fillStyle = color
  ctx.value.beginPath()
  ctx.value.ellipse(0, 8, 5, 8, 0, 0, Math.PI * 2)
  ctx.value.fill()

  ctx.value.restore()
  ctx.value.shadowBlur = 0
}

const animate = () => {
  if (!ctx.value) return
  ctx.value.clearRect(0, 0, width, height)
  drawRope()
  lamps.value.forEach(drawLamp)
  animationId = requestAnimationFrame(animate)
}

const setupCanvas = () => {
  if (!canvasRef.value) return
  NUM_LAMPS = Math.floor(window.innerWidth / 60)
  const canvas = canvasRef.value
  const dpr = window.devicePixelRatio || 1
  width = window.innerWidth
  height = 150
  canvas.width = width * dpr
  canvas.height = height * dpr
  ctx.value = canvas.getContext('2d')
  if (ctx.value) ctx.value.scale(dpr, dpr)
  initLamps()
}

onMounted(() => {
  setupCanvas()
  animate()
  window.addEventListener('resize', setupCanvas)
})

onUnmounted(() => {
  window.removeEventListener('resize', setupCanvas)
  cancelAnimationFrame(animationId)
})

watch(
    () => uiStore.garlandIsActive,
    toggleColor
)
</script>

<template>
  <div>
    <canvas ref="canvasRef" class="garland-canvas" />
  </div>
</template>

<style scoped>
.garland-canvas {
  position: fixed;
  top: -5px;
  left: 0;
  width: 100vw;
  height: 150px;
  pointer-events: none;
  z-index: -1;
}
</style>