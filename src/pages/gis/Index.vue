<template>
  <a-row :gutter="16" class="gis-home">
    <a-col :span="6" class="left">
      <!-- <a-card :bordered="false"> -->
      <!-- <div class="section-title">GIS</div> -->
      <!-- <a-space direction="vertical" style="width: 100%">
          <a-button type="primary" size="large" block @click="toTravel"
            >旅游记录</a-button
          >
          <a-button size="large" block @click="toPlan">路线规划</a-button>
        </a-space> -->
      <!-- </a-card> -->
    </a-col>
    <a-col :span="18" class="right">
      <div ref="globeContainer" id="container" class="globe-container"></div>
    </a-col>
  </a-row>
</template>
<script setup lang="ts">
import { useRouter } from "vue-router";
import { onMounted, onBeforeUnmount, ref } from "vue";
import earthFlyLine from "earth-flyline";
import geojson from "@/assets/map/world.json";
import * as THREE from "three";

let chart: any = null;
let resizeTimer: any = null;

const earthConfig = {
  R: 240,
  stopRotateByHover: false,
  earth: {
    color: "#13162c",
  },
  mapStyle: {
    areaColor: "#2e3564",
    lineColor: "#797eff",
  },
  spriteStyle: {
    color: "#797eff",
  },
  pathStyle: {
    color: "#cd79ff",
  },
  flyLineStyle: {
    color: "#cd79ff",
  },
  scatterStyle: {
    color: "#cd79ff",
  },
  hoverRegionStyle: {
    areaColor: "#cd79ff",
    show: false,
  },
  regions: {
    China: {
      areaColor: "#2e3564",
    },
  },
};
const initGlobe = () => {
  earthFlyLine.registerMap("world", geojson);
  //获取dom节点作为容器 注：该节点请设置宽高
  const dom: any = document.getElementById("container");
  chart = earthFlyLine.init({
    dom,
    map: "world",
    config: earthConfig,
    limitFps: true,
  });
  const style = chart.style;
  const cam = chart.camera;
  const widthPx = style.width || dom.clientWidth || 0;
  const px = widthPx / 2; // Anchor to right edge
  if (widthPx > 0) {
    if (cam.isOrthographicCamera) {
      const k = style.width / style.height;
      const s = 130;
      const viewWidthWorld = 2 * s * k;
      const worldDx = (px * viewWidthWorld) / widthPx;
      chart.mainContainer.position.x += worldDx;
    } else if (cam.isPerspectiveCamera) {
      const aspect = cam.aspect;
      const fovRad = (cam.fov * Math.PI) / 180;
      const d = cam.position.distanceTo(new THREE.Vector3(0, 0, 0));
      const viewWidthWorld = 2 * d * Math.tan(fovRad / 2) * aspect;
      const worldDx = (px * viewWidthWorld) / widthPx;
      const forward = new THREE.Vector3();
      cam.getWorldDirection(forward);
      const right = new THREE.Vector3()
        .crossVectors(forward, cam.up)
        .normalize();
      chart.mainContainer.position.add(right.multiplyScalar(worldDx));
    }
  }
};

const router = useRouter();
const toTravel = () => router.push("/gis");
const toPlan = () => router.push("/gis");

const handleResize = () => {
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const dom = document.getElementById("container");
    if (dom) {
      dom.innerHTML = ""; // 清空容器
    }
    // 尝试调用销毁方法（如果有）
    if (chart) {
      if (typeof chart.dispose === "function") chart.dispose();
      else if (typeof chart.destroy === "function") chart.destroy();
    }
    initGlobe();
  }, 200); // 200ms 防抖
};

onMounted(() => {
  initGlobe();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  if (resizeTimer) clearTimeout(resizeTimer);
});
</script>
<style scoped>
.gis-home {
  height: 100%;
}
.left {
  display: flex;
  align-items: center;
}
.right {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 100%;
}
.globe-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
