<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Snowflake {
  x: number
  y: number
  size: number
  speed: number
  wind: number
  opacity: number
}

const SNOW_CONFIG = {
  COUNT: 100,
  SPEED: 0.2,
  COLOR: '#ffffff',
  SIZE: 2,
  OPACITY: 0.7,
  WIND: 0.2
} as const

const canvasRef = ref<HTMLCanvasElement | null>(null)
const ctx = ref<CanvasRenderingContext2D | null>(null)
const animationId = ref<number | null>(null)
const snowflakes = ref<Snowflake[]>([])

const createSnowflake = (): Snowflake | null => {
  const canvas = canvasRef.value
  if (!canvas) return null

  return {
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height,
    size: SNOW_CONFIG.SIZE,
    speed: Math.random() * SNOW_CONFIG.SPEED + 0.3,
    wind: (Math.random() - 0.5) * SNOW_CONFIG.WIND,
    opacity: Math.random() * 0.3 + SNOW_CONFIG.OPACITY
  }
}

const initializeSnowflakes = () => {
  snowflakes.value = []

  for (let i = 0; i < SNOW_CONFIG.COUNT; i++) {
    const flake = createSnowflake()
    if (flake) snowflakes.value.push(flake)
  }
}

const setupCanvas = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  canvas.width = canvas.clientWidth
  canvas.height = canvas.clientHeight

  ctx.value = canvas.getContext('2d')
  initializeSnowflakes()
}

const drawSnowflake = (flake: Snowflake) => {
  const context = ctx.value
  if (!context) return

  context.beginPath()
  context.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2)
  context.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`
  context.fill()
}

const updateSnowflakes = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  snowflakes.value.forEach(flake => {
    flake.y += flake.speed
    flake.x += flake.wind

    if (flake.y > canvas.height) {
      flake.y = -10
      flake.x = Math.random() * canvas.width
    }

    if (flake.x > canvas.width + 10) flake.x = -10
    if (flake.x < -10) flake.x = canvas.width + 10
  })
}

const drawFrame = () => {
  const canvas = canvasRef.value
  const context = ctx.value
  if (!canvas || !context) return

  context.clearRect(0, 0, canvas.width, canvas.height)
  snowflakes.value.forEach(drawSnowflake)
  updateSnowflakes()
}

const animate = () => {
  drawFrame()
  animationId.value = requestAnimationFrame(animate)
}

const handleResize = () => {
  setupCanvas()
}

onMounted(() => {
  setupCanvas()
  animate()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (animationId.value !== null) {
    cancelAnimationFrame(animationId.value)
  }
})
</script>

<template>
  <canvas ref="canvasRef" class="snow-canvas"></canvas>
</template>

<style scoped>
.snow-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: -1;
}
</style>