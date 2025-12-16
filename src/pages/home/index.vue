<template>
  <div class="home-container">
    <h1>欢迎来到Elect-Tool</h1>
    
    <!-- <div class="pet-playground" ref="playgroundRef">
      <CatPet 
        v-if="playgroundWidth > 0"
        :action="currentAction" 
        :container-width="playgroundWidth" 
        :container-height="playgroundHeight"
      />
    </div>

    <div class="control-panel">
      <h3>我的电子宠物</h3>
      <div class="command-group">
        <a-button @click="triggerAction('idle')" :type="currentAction === 'idle' ? 'primary' : 'default'">
          <template #icon><RestOutlined /></template>
          发呆
        </a-button>
        <a-button @click="triggerAction('sleep')" :type="currentAction === 'sleep' ? 'primary' : 'default'">
          睡觉
        </a-button>
        <a-button @click="triggerAction('run')" :type="currentAction === 'run' ? 'primary' : 'default'">
          <template #icon><ThunderboltOutlined /></template>
          奔跑
        </a-button>
        <a-button @click="triggerAction('jump')" :type="currentAction === 'jump' ? 'primary' : 'default'">
          <template #icon><UpCircleOutlined /></template>
          跳跃
        </a-button>
        <a-button @click="triggerAction('happy')" :type="currentAction === 'happy' ? 'primary' : 'default'">
          <template #icon><SmileOutlined /></template>
          撒娇
        </a-button>
      </div>
      <div class="instruction">
        点击按钮与小猫互动，或者静静看着它在乐园里玩耍吧！
      </div>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import CatPet from '@/components/CatPet.vue';
import { 
  RestOutlined, 
  ThunderboltOutlined, 
  UpCircleOutlined, 
  SmileOutlined 
} from '@ant-design/icons-vue';

const currentAction = ref('');
const playgroundRef = ref<HTMLElement | null>(null);
const playgroundWidth = ref(0);
const playgroundHeight = ref(0);

const updateDimensions = () => {
  if (playgroundRef.value) {
    playgroundWidth.value = playgroundRef.value.clientWidth;
    playgroundHeight.value = playgroundRef.value.clientHeight;
  }
};

onMounted(() => {
  updateDimensions();
  window.addEventListener('resize', updateDimensions);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateDimensions);
});

const triggerAction = (action: string) => {
  if (action === 'jump') {
    currentAction.value = 'jump';
    setTimeout(() => {
      currentAction.value = ''; // Return to auto mode
    }, 1000);
  } else {
    // Toggle: if clicking the same action, return to auto mode (empty string)
    if (currentAction.value === action) {
      currentAction.value = '';
    } else {
      currentAction.value = action;
    }
  }
};
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  height: 100%;
}

.pet-playground {
  width: 100%;
  max-width: 800px; /* Wider playground */
  height: 400px;    /* Taller playground */
  position: relative;
  /* Removed flex centering so absolute positioning works relative to this box */
  background: rgba(122, 102, 255, 0.05);
  border: 2px dashed var(--border-color-base, #ccc);
  border-radius: 16px;
  margin: 30px 0;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  /* Add a floor line */
  border-bottom: 4px solid var(--brand-primary, #7a66ff);
}

.control-panel {
  text-align: center;
  background: var(--sidebar-bg, #fff);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 600px;
}

.command-group {
  display: flex;
  gap: 12px;
  margin: 15px 0;
  flex-wrap: wrap;
  justify-content: center;
}

.instruction {
  font-size: 14px;
  color: var(--text-secondary, #666);
  margin-top: 10px;
}
</style>
