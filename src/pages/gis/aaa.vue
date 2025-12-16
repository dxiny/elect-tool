<template>
  <div class="gis-home">
    <div ref="globeContainer" id="container" class="globe-container"></div>
    <div class="content-overlay">
      <div class="left-zone" ref="leftZoneRef">
        <div class="stat-panel">
          <div class="stat-title">旅游留痕</div>
          <div class="stat-subtitle">总计公里数</div>
          <div class="stat-total">543,221<span class="unit">km</span></div>
        </div>
        <div
          class="glass-btn-group"
          v-if="showGlassBtns"
          :style="statCardStyle"
        >
          <div class="glass-btn" style="--clr: #7a66ff" @click="toTravel">
            <span class="btn-text">仔细看看</span>
          </div>
          <div class="glass-btn" style="--clr: #7a66ff" @click="toPlan">
            <span class="btn-text">制定计划</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="card-header">
            <div class="card-title">旅程对比</div>
            <div class="card-trend">
              <span class="trend-val">87%</span>
              <span class="trend-diff up"><ArrowUpOutlined /> 12%</span>
            </div>
            <div class="card-subtitle">较去年增长12%</div>
          </div>
          <div ref="statChartEl" class="chart-container"></div>
          <div class="stat-list">
            <div
              class="stat-item"
              v-for="(item, index) in displayedTravelList"
              :key="index"
            >
              <div class="rank-icon" :class="'rank-' + (index + 1)">
                <img
                  v-if="index < 3"
                  :src="medalIcon"
                  class="rank-img"
                  alt="medal"
                />
                <span v-else class="rank-num">{{ index + 1 }}</span>
              </div>
              <span class="city">{{ item.city }}</span>
              <span class="days">{{ item.days }}</span>
              <span class="cost">{{ item.cost }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useRouter } from "vue-router";
import { onMounted, onBeforeUnmount, ref } from "vue";
import earthFlyLine from "earth-flyline";
import geojson from "@/assets/map/world.json";
import * as THREE from "three";
import * as echarts from "echarts";
import { ArrowUpOutlined } from "@ant-design/icons-vue";
import medalIcon from "@/assets/svg/奖牌勋章.svg";

let chart: any = null;
let resizeTimer: any = null;
let spinId: number = 0;
const statChartEl = ref<HTMLElement | null>(null);
const leftZoneRef = ref<HTMLElement | null>(null);
let statChart: echarts.ECharts | null = null;

const travelList = [
  { city: "新疆", days: "13天", cost: "¥14,544" },
  { city: "重庆", days: "7天", cost: "¥6,574" },
  { city: "开封", days: "5天", cost: "¥8,742" },
  { city: "象山", days: "4天", cost: "¥3,464" },
  { city: "苏州", days: "2天", cost: "¥2,588" },
];

const displayedTravelList = ref(travelList);
const showGlassBtns = ref(true);
const statCardStyle = ref({});

const initStatChart = () => {
  if (!statChartEl.value) return;

  // 计算容器宽度
  // 直接使用 offsetWidth，并且如果宽度为0（可能隐藏或未渲染），尝试用计算逻辑推断
  // 在 resize 时，容器宽度可能还没更新，我们使用 updateLeftZoneLayout 中计算的宽度逻辑
  const container = document.getElementById("container");
  const widthPx = container ? container.clientWidth : window.innerWidth;

  // 重新计算 leftZone 的宽度 (逻辑同 updateLeftZoneLayout)
  const totalZoneWidth = widthPx * 0.45;
  const contentWidth = totalZoneWidth * 0.6;

  // 使用计算出的 contentWidth 减去 padding (24px * 2 = 48px)
  const availableWidth = contentWidth - 48;

  // 假设每根柱子需要约 25px (6px柱宽 + 间隙)
  const barWidth = 6;
  const gap = 14; // 柱子间隙
  const itemWidth = barWidth + gap;

  const maxBars = Math.floor(availableWidth / itemWidth);

  // 限制最大12根，最小5根
  const barCount = Math.max(5, Math.min(12, maxBars));

  // 动态调整图表高度：根据窗口宽度和柱子数量进行更细致的自适应
  // 1. 基础高度：小屏(barCount < 8)更矮，大屏更高
  // 2. 窗口高度因子：如果窗口本身很矮，也要限制图表高度
  const windowHeight = window.innerHeight;
  const isSmallScreen = barCount < 10;

  // 动态调整列表显示数量
  // 如果柱子少于8根（小屏模式），列表只显示前3条
  displayedTravelList.value = isSmallScreen
    ? travelList.slice(0, 3)
    : travelList;

  // 控制按钮组显示和卡片样式
  // 严格定义“最大窗口”：
  // 1. 屏幕宽度足够大 (>= 1600px)
  // 2. 且柱子数量足够多 (barCount >= 11)
  // 3. 必须不能是小屏模式 (barCount >= 8) - 这一条被 barCount >= 11 覆盖了
  // 关键：如果 barCount 计算有误（例如没重新计算导致一直很大），按钮就会一直显示。
  // 我们确保在 initStatChart 每次都重新计算 barCount。
  const isLargeScreen = barCount >= 11 && window.innerWidth >= 1300;

  // 确保 showGlassBtns 的更新是响应式的，并且强制触发视图更新
  // 有时候 vue 的响应式在复杂逻辑中可能没及时更新，这里显式赋值
  if (!isLargeScreen) {
    showGlassBtns.value = false;
    statCardStyle.value = {};
  } else {
    const wasHidden = !showGlassBtns.value;
    showGlassBtns.value = true;
    // 动态计算 margin-top: 根据窗口高度按比例分配
    // 窗口高度越高，间距越大，避免留白过多或过少
    // 假设基准高度 800px 时 margin 30px
    // 最小 20px，最大 60px
    const dynamicMargin = Math.max(20, Math.min(60, windowHeight * 0.04));
    statCardStyle.value = { marginTop: `${dynamicMargin}px` };

    // 当按钮从隐藏变为显示时，或者每次 resize 时（为了保险），重新绑定
    if (wasHidden) {
      // 使用 nextTick 确保 DOM 已渲染
      setTimeout(() => {
        bindMagneticEffect();
      }, 100); // 增加延时到 100ms
    }
  }

  // 更加激进的压缩高度，确保内容不溢出
  let chartHeight;
  if (isSmallScreen) {
    // 小屏模式：基础 100px
    // 窗口 < 600px -> 80px
    chartHeight = windowHeight < 600 ? 80 : 100;
  } else {
    // 大屏模式：基础 160px
    // 窗口 < 800px -> 120px
    // 窗口 < 600px -> 90px
    if (windowHeight < 600) chartHeight = 90;
    else if (windowHeight < 800) chartHeight = 120;
    else chartHeight = 160;
  }

  if (statChartEl.value) {
    statChartEl.value.style.height = `${chartHeight}px`;
  }

  // 如果是大屏模式，我们需要根据最终的 chartHeight 重新精细计算 margin-top
  if (isLargeScreen) {
    // 目标：确保卡片底部与窗口底部有合适的距离（例如 30px）
    // 但如果内容太多，优先压缩 margin-top

    // 估算内容高度（不含 margin-top）
    // 顶部标题区 ~160px
    // 按钮区 50px + 20px(margin-bottom) = 70px
    // 卡片头部 ~80px
    // 图表区域 chartHeight
    // 列表区域 (5行 * 28px) + 10px(gap) ~ 150px
    // 卡片 padding 48px
    // 总计约 508px + chartHeight

    const contentHeight = 508 + chartHeight;
    const availableSpace = windowHeight - contentHeight;

    // 剩余空间分配：
    // 顶部留白 (stat-panel margin-top 60px) + 底部留白 (30px) + 中间间距 (dynamicMargin)
    // 实际上 .stat-panel 的 margin-top: 60px 是写在 CSS 里的。
    // 所以 availableSpace 还要减去 60px (top) 和 30px (bottom padding)

    const remainingForMiddle = availableSpace - 70 - 30;

    // 限制 dynamicMargin 在 10px 到 38px 之间
    const dynamicMargin = Math.max(10, Math.min(38, remainingForMiddle));

    statCardStyle.value = { marginTop: `${dynamicMargin}px` };
  } else {
    statCardStyle.value = {};
  }

  // 动态截取数据
  // 背景条数据
  const bgData = new Array(barCount).fill(200);

  const fullData1 = [
    80, 110, 60, 120, 150, 130, 160, 90, 110, 70, 120, 140,
  ].map((v) => v * 0.6); // 下层数据 (约 30%-50% 高度)
  const fullData2 = [
    400, 120, 90, 140, 160, 150, 180, 110, 130, 90, 150, 170,
  ].map((v) => v * 0.3); // 上层数据 (约 15%-30% 高度)

  const fullXAxis = [
    "2013",
    "2014",
    "2015",
    "2016",
    "2017",
    "2018",
    "2019",
    "2020",
    "2021",
    "2022",
    "2023",
    "2024",
  ];

  const data1 = fullData1.slice(12 - barCount);
  const data2 = fullData2.slice(12 - barCount);
  const xAxisData = fullXAxis.slice(12 - barCount);

  if (statChart) {
    statChart.dispose();
  }
  statChart = echarts.init(statChartEl.value);
  const option = {
    grid: {
      top: 10,
      bottom: 0,
      left: 0,
      right: 0,
      containLabel: false,
    },
    xAxis: {
      type: "category",
      data: xAxisData,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      splitLine: { show: false },
    },
    yAxis: {
      type: "value",
      show: false,
      max: 200, // 固定最大值以确保背景条一致
    },
    series: [
      {
        // 背景阴影条
        type: "bar",
        z: 0,
        itemStyle: {
          color: "rgba(255, 255, 255, 0.05)",
          borderRadius: 4,
        },
        barGap: "-100%",
        barWidth: 6,
        data: bgData,
        silent: true,
      },
      {
        name: "Travel Cities",
        type: "bar",
        stack: "total",
        z: 1,
        barWidth: 6,
        data: data1,
        itemStyle: {
          color: "#797eff",
          borderRadius: [4, 4, 4, 4],
        },
      },
      // 插入一个透明间隔层
      {
        name: "",
        type: "bar",
        stack: "total",
        barWidth: 6,
        data: new Array(barCount).fill(4), // 间隔高度
        itemStyle: {
          color: "transparent",
        },
        tooltip: { show: false },
      },
      {
        name: "Travel Cost",
        type: "bar",
        stack: "total",
        z: 1,
        barWidth: 6,
        data: data2,
        itemStyle: {
          color: "#ff7979",
          borderRadius: [4, 4, 4, 4], // 全圆角
        },
      },
    ],
  };
  statChart.setOption(option);
};

const config = {
  R: 240,
  stopRotateByHover: false,
  earth: {
    color: "#13162c",
    dragConfig: {
      disableY: true,
    },
  },
  enableZoom: false,
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
const updateLeftZoneLayout = () => {
  if (!leftZoneRef.value) return;
  const container = document.getElementById("container");
  const widthPx = container ? container.clientWidth : window.innerWidth;

  // New calculation logic:
  // 1. Target total width is 45% of screen width
  const totalZoneWidth = widthPx * 0.45;

  // 2. Content width is 60% of that 45%
  const contentWidth = totalZoneWidth * 0.6;

  // 3. Remaining 40% is split into two 20% margins
  //    Margin = totalZoneWidth * 0.2
  const margin = totalZoneWidth * 0.2;

  leftZoneRef.value.style.position = "absolute";
  leftZoneRef.value.style.left = `${margin}px`;
  leftZoneRef.value.style.width = `${contentWidth}px`;
  leftZoneRef.value.style.paddingLeft = "0";
  leftZoneRef.value.style.top = "0"; // Ensure top alignment
};

const bindMagneticEffect = () => {
  const btns = document.querySelectorAll(".glass-btn");
  console.log("Binding magnetic effect to", btns.length, "buttons");

  if (btns.length === 0) {
    // 可能是因为 v-if 还没生效，或者按钮被隐藏了
    // 检查 showGlassBtns 状态
    if (showGlassBtns.value) {
      console.log("Buttons should be visible but not found, retrying...");
      setTimeout(bindMagneticEffect, 100);
    }
    return;
  }

  btns.forEach((btn) => {
    const btnEle = btn as HTMLElement;

    // 初始化变量
    btnEle.style.setProperty("--x", "50%");
    btnEle.style.setProperty("--y", "50%");

    // 使用 mouseenter 确保进入时就触发一次位置更新
    btnEle.onmouseenter = (e: MouseEvent) => {
      const rect = btnEle.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      btnEle.style.setProperty("--x", `${x}px`);
      btnEle.style.setProperty("--y", `${y}px`);
    };

    btnEle.onmousemove = (e: MouseEvent) => {
      const rect = btnEle.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const btnWidth = btnEle.clientWidth;
      const btnHeight = btnEle.clientHeight;
      const transX = x - btnWidth / 2;
      const transY = y - btnHeight / 2;

      // 磁性移动 - 移除位置偏移，保持按钮静止
      // btnEle.style.transform = `translateX(${transX / 3}px) translateY(${transY / 3}px)`;

      // 设置 CSS 变量，仅用于背景扩散动画
      btnEle.style.setProperty("--x", `${x}px`);
      btnEle.style.setProperty("--y", `${y}px`);
    };

    btnEle.onmouseout = () => {
      // 移除 transform 重置，因为我们不再设置 transform
      // btnEle.style.transform = "";
    };
  });
};

const initGlobe = () => {
  earthFlyLine.registerMap("world", geojson);
  //获取dom节点作为容器 注：该节点请设置宽高
  const dom: any = document.getElementById("container");

  chart = earthFlyLine.init({
    dom,
    map: "world",
    config: config,
    limitFps: true,
  });

  if (!chart) return;

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
  // Update UI layout independently of 3D logic
  updateLeftZoneLayout();

  const scatterStyle = {
    color: "#cd79ff",
    size: config.R * 0.05, //涟漪的尺寸 默认为 半径R*0.05
    duration: 2000, // 一个完成动画所需时间(单位毫秒)，值越小动画速度越快
    delay: 0, //延迟执行时间默认
    repeat: Infinity, //循环次数 无限循环
    customFigure: false, //（该字段查看config.scatterStyle.customFigure详解）
  };
  const pathStyle = {
    color: "#cd79ff",
    show: true,
  };
  const flyLineStyle = {
    color: "#cd79ff",
    duration: 2000, // 一个完成动画所需时间(单位毫秒)，值越小动画速度越快
    delay: 0, //延迟执行时间默认
    repeat: Infinity, //循环次数 无限循环
  };
  const flyLineData = [
    {
      from: { id: 1, lon: 120.1551, lat: 30.2741, style: scatterStyle },
      to: { id: 2, lon: 126.6424, lat: 45.756, style: scatterStyle },
      style: { pathStyle, flyLineStyle },
    },
    {
      from: { id: 3, lon: 120.1551, lat: 30.2741, style: scatterStyle },
      to: { id: 4, lon: 106.5516, lat: 29.563, style: scatterStyle },
      style: { pathStyle, flyLineStyle },
    },
    {
      from: { id: 7, lon: 120.1551, lat: 30.2741, style: scatterStyle },
      to: { id: 8, lon: 121.8693, lat: 29.4766, style: scatterStyle },
      style: { pathStyle, flyLineStyle },
    },
  ];
  chart.addData("flyLine", flyLineData);
};

const router = useRouter();
const toTravel = () => router.push("/gis");
const toPlan = () => router.push("/gis");

const handleResize = () => {
  // Immediate layout update for smoothness
  updateLeftZoneLayout();

  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (spinId) cancelAnimationFrame(spinId);

    // 重新获取容器宽度，确保计算准确
    // 在 resize 过程中，leftZone 的宽度可能会发生变化，导致 initStatChart 计算不准
    // 我们需要先 updateLeftZoneLayout 确保容器大小已定，再初始化图表
    updateLeftZoneLayout();

    // 使用 nextTick 或者简单的延时，等待 DOM 布局更新
    setTimeout(() => {
      initStatChart();
    }, 0);

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
  // 初始加载时也要尝试初始化图表，这会触发 initStatChart -> 计算 showGlassBtns -> bindMagneticEffect
  initStatChart();
  window.addEventListener("resize", handleResize);

  // 如果初始就是大屏，可能 initStatChart 里绑定失败（因为 DOM 还没渲染完？）
  // 在 mounted 最后再试一次
  setTimeout(() => {
    if (showGlassBtns.value) {
      bindMagneticEffect();
    }
  }, 500);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  if (resizeTimer) clearTimeout(resizeTimer);
  if (spinId) cancelAnimationFrame(spinId);
  if (statChart) statChart.dispose();
});
</script>
<style scoped>
.chart-wrapper {
  position: relative;
  width: 100%;
}
.float-stat-card {
  position: absolute;
  top: 0;
  left: 0;
  background: #fff;
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  color: #333;
  min-width: 160px;
  z-index: 10;
}
.float-header {
  font-size: 12px;
  color: #888;
  margin-bottom: 4px;
}
.float-content {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
}
.float-val {
  font-size: 20px;
  font-weight: 700;
  color: #333;
}
.float-trend {
  font-size: 12px;
  font-weight: 600;
}
.float-trend.up {
  color: #4cd964;
}
.float-footer {
  font-size: 10px;
  color: #999;
}
/* 背景颜色和布局设置 */
/* 
body {
  min-height: 100vh;
  background-color: #222;
  ...
}
这个 body 样式可能会影响全局，在 scoped css 中通常不需要。
但在 scoped 中写 body 样式是不生效的（除非用 :global(body)），或者只影响组件根元素。
这里我们假设 .gis-home 是背景容器
*/

.gis-home {
  height: 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
  /* 动态背景色：暗色用深蓝黑，亮色用浅灰 */
  background-color: #000000;
  transition: background-color 0.3s ease;
}

/* 文本颜色适配 */
.stat-panel {
  margin-top: 60px;
  pointer-events: auto;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  display: flex;
  flex-direction: column;
  position: relative; /* 确保 z-index 生效 */
  z-index: 10; /* 提升层级，高于 canvas */
}

.stat-header {
  margin-bottom: 40px;
}

.stat-title {
  font-size: 26px;
  color: #aeb4d1;
  margin-bottom: 20px;
  font-weight: 700;
}

.stat-subtitle {
  font-size: 14px;
  color: #6e7592;
  margin-top: 10px;
  margin-bottom: 6px;
  font-weight: 500;
}

.stat-total {
  font-size: 48px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
  font-feature-settings: "tnum";
  letter-spacing: -1px;
  margin-bottom: 20px;
}

.stat-total .unit {
  font-size: 18px;
  color: #aeb4d1;
  margin-left: 6px;
  font-weight: 400;
}

/* 卡片背景适配 */
.stat-card {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
}

.card-header {
  margin-bottom: 20px;
}

.card-title {
  font-size: 14px;
  color: #aeb4d1;
  margin-bottom: 4px;
}

.card-trend {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
}

.trend-val {
  font-size: 32px;
  font-weight: 600;
  color: #fff;
}

.trend-diff {
  font-size: 14px;
  font-weight: 500;
}

.trend-diff.up {
  color: #4cd964;
}

.card-subtitle {
  font-size: 12px;
  color: #6e7592;
}

.chart-container {
  height: 200px;
  width: 100%;
  margin-bottom: 20px;
}

.legend-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 8px;
}

.stat-list {
  display: flex;
  flex-direction: column;
  gap: 8px; /* 缩小垂直间距 */
  margin-top: 10px;
}

.stat-item {
  display: flex;
  align-items: center;
  font-size: 13px;
  padding: 2px 0; /* 减小内边距 */
  white-space: nowrap; /* 禁止换行 */
}

.stat-item .label,
.days {
  color: #aeb4d1;
}

.stat-item .val,
.stat-item .val-2,
.city,
.cost {
  color: #fff;
}

.rank-icon {
  width: 20px; /* 缩小图标容器 */
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px; /* 减小右边距 */
  font-size: 14px;
}

.rank-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.rank-num {
  font-weight: 700;
  color: #6e7592;
  font-size: 14px;
}

.city {
  color: #fff;
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis; /* 文字过长显示省略号 */
  margin-right: 8px;
}

.days {
  color: #aeb4d1;
  width: auto; /* 自适应宽度 */
  min-width: 40px; /* 最小宽度保证对齐 */
  text-align: right;
  margin-right: 8px; /* 减小右边距 */
}

.cost {
  color: #fff;
  font-weight: 600;
  width: auto; /* 自适应宽度 */
  min-width: 60px; /* 最小宽度保证对齐 */
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.glass-btn-group {
  display: flex;
  gap: 16px; /* 按钮之间的水平间距 */
  margin: 20px 0 50px 0; /* 与下方卡片的间距 */
  width: 100%;
}

.glass-btn {
  flex: 1; /* 按钮平分宽度 */
  position: relative;
  height: 50px;
  border-radius: 25px; /* Pill shape */
  background: rgba(255, 255, 255, 0.05); /* 磨砂背景，低透明度 */
  backdrop-filter: blur(20px); /* 强磨砂效果 */
  /* 柔和的炫光边框 */
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.1); /* 内发光 */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  /* transition: transform 0.1s; 移除 transform transition */
  overflow: hidden;
  z-index: 1; /* 确保层叠上下文 */
  pointer-events: auto; /* 强制开启交互 */
}

/* 扩散圆圈效果 */
.glass-btn::before {
  content: "";
  position: absolute;
  top: var(--y);
  left: var(--x);
  transform: translate(-50%, -50%);
  background-color: var(--clr);
  width: 0;
  height: 0;
  border-radius: 50%;
  transition: width 0.5s ease, height 0.5s ease;
  pointer-events: none; /* 确保不阻挡鼠标事件 */
  z-index: 0;
}

/* 修正 hover 状态 */
.glass-btn:hover::before {
  width: 300px;
  height: 300px;
}

/* 边缘光线增强 (Hover 状态下需要适配实色背景) */
.glass-btn:hover {
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.3),
    inset 0 0 20px rgba(255, 255, 255, 0.1);
  /* background 移除，因为被 ::before 覆盖了 */
}

.glass-btn:active {
  transform: scale(0.98);
}

.btn-icon {
  position: relative;
  z-index: 2; /* Ensure text is above circle */
  font-size: 20px;
  color: #fff;
  font-weight: 300;
  /* Icon glow */
  text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
}

.btn-text {
  position: relative;
  z-index: 2; /* Ensure text is above circle */
  font-size: 16px;
  color: #fff;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.right {
  display: none;
}
.globe-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.content-overlay {
  height: 100%;
  pointer-events: none; /* 让鼠标事件穿透到 globe，但子元素可以通过 pointer-events: auto 恢复 */
}
.left-zone {
  height: 100%;
  display: flex;
  flex-direction: column;
  pointer-events: none; /* 自身不响应，让子元素响应 */
  box-sizing: border-box;
  position: relative;
  z-index: 20; /* 再次提升层级，确保在最上层 */
}
</style>
