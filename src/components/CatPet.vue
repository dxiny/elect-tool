<template>
  <div 
    class="cat-wrapper" 
    :style="{ 
      transform: `translate(${position.x}px, ${position.y}px)`,
      transition: isMoving ? 'none' : 'transform 0.5s ease-in-out'
    }"
  >
    <div 
      class="cat-container" 
      :class="currentAction"
      :style="{ transform: direction === -1 ? 'scaleX(-1)' : 'scaleX(1)' }"
    >
      <!-- High Detail Calico Pixel Art SVG: 32x32 Grid -->
      <!-- Organic/Rounded Style -->
      <svg viewBox="0 0 32 32" class="cat-svg" shape-rendering="crispEdges">

        <g class="tail-group">
          <path d="M26 22 Q28 20 28 16 Q28 13 26 11 L25 12 Q26 13 26 16 Q26 20 24 22 Z" fill="#2E2E2E" />
          <path d="M25 21 Q26 19 26 17 Q26 16 25 15 L24 16 Q24 18 24 19 Q24 20 25 21 Z" fill="#E8A668" />
          <path d="M27 18 Q27 17 26 16 L26 15 Q27 16 27 18 Z" fill="#787878" />
        </g>

        <g class="leg back-left">
          <ellipse cx="12.5" cy="29" rx="1.5" ry="2" fill="#2E2E2E" />
          <ellipse cx="12.5" cy="28" rx="1" ry="1.5" fill="#FFFFFF" />
        </g>
        <g class="leg back-right">
          <ellipse cx="16.5" cy="29" rx="1.5" ry="2" fill="#2E2E2E" />
          <ellipse cx="16.5" cy="28" rx="1" ry="1.5" fill="#DDD" />
        </g>

        <g class="body-group">
          <ellipse cx="16" cy="22" rx="8" ry="6" fill="#2E2E2E" />
          <ellipse cx="16" cy="22" rx="7" ry="5" fill="#FFFFFF" />
          <path d="M12 20 Q14 19 15 20 Q16 21 15 22 Q13 23 12 22 Z" fill="#E8A668" />
          <path d="M19 23 Q20 22 21 22 Q22 23 21 24 Q20 24 19 23 Z" fill="#787878" />
        </g>

        <g class="leg front-left">
          <ellipse cx="23.5" cy="29" rx="1.5" ry="2" fill="#2E2E2E" />
          <ellipse cx="23.5" cy="28" rx="1" ry="1.5" fill="#FFFFFF" />
        </g>
        <g class="leg front-right">
          <ellipse cx="20.5" cy="29" rx="1.5" ry="2" fill="#2E2E2E" />
          <ellipse cx="20.5" cy="28" rx="1" ry="1.5" fill="#DDD" />
        </g>

        <g class="head-group">
          <circle cx="23" cy="15" r="6" fill="#2E2E2E" />
          <circle cx="23" cy="15" r="5" fill="#FFFFFF" />
          <path d="M20 11 Q21 12 21 13 Q20 14 19 14 Q19 12 20 11 Z" fill="#787878" />
          <path d="M25 11 Q26 12 26 13 Q25 14 24 14 Q24 12 25 11 Z" fill="#E8A668" />

          <path d="M18 12 L20 8 L21 11 Z" fill="#2E2E2E" />
          <path d="M26 12 L27 8 L29 11 Z" fill="#2E2E2E" />
          <path d="M19.5 10.5 L20 9.5 L20.5 10.8 Z" fill="#FFB7C5" />
          <path d="M27.5 10.5 L27.9 9.5 L28.5 10.8 Z" fill="#FFB7C5" />

          <g class="face">
            <rect x="20" y="14" width="2" height="2" fill="#2E2E2E" />
            <rect x="25" y="14" width="2" height="2" fill="#2E2E2E" />
            <rect x="20" y="14" width="1" height="1" fill="#FFF" />
            <rect x="25" y="14" width="1" height="1" fill="#FFF" />
            <rect x="19" y="16" width="1" height="1" fill="#FFB7C5" opacity="0.6" />
            <rect x="27" y="16" width="1" height="1" fill="#FFB7C5" opacity="0.6" />
            <rect x="23" y="16" width="1" height="1" fill="#FFB7C5" />
            <rect x="23" y="17" width="1" height="1" fill="#2E2E2E" />
          </g>
        </g>

      </svg>
      
      <!-- Speech Bubble -->
      <div v-if="message" class="bubble" :style="{ transform: direction === -1 ? 'translateX(50%) scaleX(-1)' : 'translateX(-50%)' }">{{ message }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  containerWidth: {
    type: Number,
    default: 600
  },
  containerHeight: {
    type: Number,
    default: 300
  },
  action: {
    type: String,
    default: '' // If empty, auto mode
  }
});

// State
const currentAction = ref('idle');
const message = ref('');
const position = ref({ x: 50, y: 0 }); // Start on floor
const direction = ref(1); // 1 = right, -1 = left
const isMoving = ref(false);

// Constants
let gameLoop = null;
let behaviorTimer = null;

// Watch for external commands
watch(() => props.action, (newVal) => {
  if (newVal && newVal !== '') {
    setBehavior(newVal, true);
  }
});

const setBehavior = (act, manual = false) => {
  currentAction.value = act;
  
  if (act === 'run' || act === 'walk') {
    isMoving.value = true;
  } else {
    isMoving.value = false;
  }

  // Set message
  switch(act) {
    case 'idle':
      if (Math.random() > 0.8) message.value = '喵~';
      break;
    case 'sleep':
      message.value = 'Zzz...';
      break;
    case 'run':
      message.value = '!!!';
      break;
    case 'jump':
      message.value = '^o^';
      break;
    case 'happy':
      message.value = '<3';
      break;
    default:
      message.value = '';
  }
  
  if (message.value) {
    setTimeout(() => { message.value = ''; }, 2000);
  }

  if (manual && act !== 'sleep') { 
    clearTimeout(behaviorTimer);
    behaviorTimer = setTimeout(() => {
      decideNextMove();
    }, 3000);
  }
};

const updatePosition = () => {
  if (!isMoving.value) return;

  const speed = currentAction.value === 'run' ? 5 : 2; 
  let newX = position.value.x + (speed * direction.value);

  // Boundary checks
  const petWidth = 64; 
  const maxW = props.containerWidth - petWidth; 
  
  if (newX <= 0) {
    newX = 0;
    direction.value = 1; 
    decideNextMove();
  } else if (newX >= maxW) {
    newX = maxW;
    direction.value = -1; 
    decideNextMove();
  }

  position.value.x = newX;
};

const decideNextMove = () => {
  const r = Math.random();
  let nextState = 'idle';
  
  if (r < 0.4) nextState = 'idle';
  else if (r < 0.7) nextState = 'walk';
  else if (r < 0.85) nextState = 'run';
  else if (r < 0.95) nextState = 'happy';
  else nextState = 'sleep';

  let duration = 2000 + Math.random() * 3000;
  if (nextState === 'sleep') duration = 8000;
  if (nextState === 'walk' || nextState === 'run') {
    if (!isMoving.value) {
      direction.value = Math.random() > 0.5 ? 1 : -1;
    }
    duration = 3000 + Math.random() * 3000; 
  }

  setBehavior(nextState);

  clearTimeout(behaviorTimer);
  behaviorTimer = setTimeout(decideNextMove, duration);
};

onMounted(() => {
  gameLoop = setInterval(updatePosition, 30); // 30fps
  decideNextMove();
});

onUnmounted(() => {
  clearInterval(gameLoop);
  clearTimeout(behaviorTimer);
});
</script>

<style scoped>
.cat-wrapper {
  position: absolute;
  left: 0;
  bottom: 0; 
  width: 64px; /* 2x scale */
  height: 64px;
  z-index: 10;
  image-rendering: pixelated; 
}

.cat-container {
  width: 100%;
  height: 100%;
  position: relative;
  cursor: pointer;
  transform-origin: center bottom;
}

.cat-svg {
  width: 100%;
  height: 100%;
}

/* --- Animations --- */

/* Walk Cycle (4-leg gait) */
.walk .leg.front-right { animation: legMove 0.8s steps(4) infinite; }
.walk .leg.front-left  { animation: legMove 0.8s steps(4) infinite -0.4s; }
.walk .leg.back-right  { animation: legMove 0.8s steps(4) infinite -0.2s; }
.walk .leg.back-left   { animation: legMove 0.8s steps(4) infinite -0.6s; }

.run .leg.front-right { animation: legMove 0.4s steps(4) infinite; }
.run .leg.front-left  { animation: legMove 0.4s steps(4) infinite -0.2s; }
.run .leg.back-right  { animation: legMove 0.4s steps(4) infinite -0.1s; }
.run .leg.back-left   { animation: legMove 0.4s steps(4) infinite -0.3s; }

/* Enhanced Leg Movement */
@keyframes legMove {
  0% { transform: translateX(0); }
  25% { transform: translateX(3px) translateY(-2px); } 
  50% { transform: translateX(0); } 
  75% { transform: translateX(-3px); } 
  100% { transform: translateX(0); }
}

/* Body Bobbing */
.walk .body-group, .walk .head-group, .walk .tail-group {
  animation: bodyBob 0.8s steps(4) infinite;
}
.run .body-group, .run .head-group, .run .tail-group {
  animation: bodyBob 0.4s steps(4) infinite;
}

@keyframes bodyBob {
  0%, 50%, 100% { transform: translateY(0); }
  25%, 75% { transform: translateY(-1px); }
}

/* Idle Animation */
.idle .tail-group {
  animation: tailWag 3s steps(4) infinite alternate;
  transform-origin: 25px 21px;
}
.idle .head-group {
  animation: headBob 4s steps(2) infinite;
}

@keyframes tailWag {
  0% { transform: rotate(0deg); }
  30% { transform: rotate(10deg); }
  100% { transform: rotate(-5deg); }
}

@keyframes headBob {
  0%, 90% { transform: translateY(0); }
  95% { transform: translateY(1px); }
}

/* Sleep */
.sleep .head-group {
  transform: translateY(3px) translateX(2px); 
}
.sleep .face {
  display: none; 
}
.sleep .cat-container::after {
  content: 'z';
  position: absolute;
  top: 0;
  right: 10px;
  font-family: monospace;
  font-size: 14px;
  color: #333;
  animation: sleepZ 2s steps(2) infinite;
}

@keyframes sleepZ {
  0% { opacity: 0; transform: translateY(0); }
  50% { opacity: 1; transform: translateY(-5px); }
  100% { opacity: 0; transform: translateY(-10px); }
}

/* Happy */
.happy .cat-container {
  animation: happyJump 0.5s steps(4) infinite;
}
@keyframes happyJump {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

.bubble {
  position: absolute;
  top: -25px;
  left: 50%;
  background: white;
  padding: 4px 8px;
  border: 2px solid #2E2E2E;
  border-radius: 4px;
  font-family: monospace;
  font-weight: bold;
  font-size: 12px;
  white-space: nowrap;
  box-shadow: 2px 2px 0px rgba(0,0,0,0.2);
  color: #2E2E2E;
  animation: popIn 0.2s steps(4);
}

.bubble::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 0; 
  height: 0; 
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid #2E2E2E;
}

@keyframes popIn {
  from { opacity: 0; transform: translateX(-50%) scale(0); }
  to { opacity: 1; transform: translateX(-50%) scale(1); }
}
</style>
