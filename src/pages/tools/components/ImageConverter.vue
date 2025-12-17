<template>
  <div class="tool-content">
    <div class="header">
      <h2>图片格式转换</h2>
      <p class="subtitle">支持 SVG/PNG/JPG/ICO 等格式互转，自动处理图标尺寸</p>
    </div>

    <div class="converter-workspace">
      <div
        class="upload-box"
        :class="{ 'has-file': !!sourceFile, 'is-dragover': isDragOver }"
        @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false"
        @drop.prevent="handleDrop"
        @click="triggerUpload"
      >
        <input
          type="file"
          ref="fileInput"
          style="display: none"
          accept=".svg,.png,.jpg,.jpeg,.webp"
          @change="handleFileSelect"
        />

        <div v-if="!sourceFile" class="upload-placeholder">
          <div class="upload-btn-group">
            <div class="upload-btn-main" @click.stop="triggerUpload">
              <PlusOutlined class="plus-icon" />
              <span>选择文件</span>
            </div>
            <a-dropdown>
              <div class="upload-btn-arrow" @click.stop>
                <DownOutlined />
              </div>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="local" @click="triggerUpload">
                    <template #icon><FolderOpenOutlined /></template>
                    从设备上传
                  </a-menu-item>
                  <a-menu-item key="url" @click="showUrlModal">
                    <template #icon><LinkOutlined /></template>
                    从网址添加
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
          <div class="upload-hint">最大文件大小 1GB</div>
        </div>

        <div v-else class="file-preview-card">
          <div class="file-icon">
            <FileImageOutlined v-if="!previewUrl" />
            <img v-else :src="previewUrl" class="thumb-img" />
          </div>
          <div class="file-details">
            <span class="file-name">{{ sourceFile.name }}</span>
            <span class="file-size">{{ formatSize(sourceFile.size) }}</span>
          </div>
          <a-button
            type="text"
            danger
            class="remove-btn"
            @click.stop="clearFile"
          >
            <CloseOutlined />
          </a-button>
        </div>
      </div>
      <!-- URL Modal -->
      <a-modal
        v-model:open="urlModalVisible"
        title="通过 URL 添加文件"
        @ok="handleUrlSubmit"
        okText="提交"
        cancelText="取消"
      >
        <a-input
          v-model:value="urlInput"
          placeholder="请输入图片网址 (https://...)"
          allow-clear
          @pressEnter="handleUrlSubmit"
        />
      </a-modal>
      <div class="action-bar" v-if="sourceFile">
        <a-button
          type="primary"
          size="large"
          class="convert-btn"
          :loading="converting"
          @click="convert"
        >
          开始转换
          <ArrowRightOutlined />
        </a-button>
      </div>

      <div class="settings-container">
        <div class="accordion-header" @click="toggleSettings">
          <div class="accordion-title">
            <SettingOutlined class="gear-icon" />
            <span>高级设置 (可选)</span>
          </div>
          <div class="accordion-arrow" :class="{ open: isSettingsOpen }">
            <DownOutlined />
          </div>
        </div>

        <div class="accordion-content" v-show="isSettingsOpen">
          <div class="setting-row">
            <label>目标格式</label>
            <a-select
              v-model:value="targetFormat"
              style="width: 200px"
              size="large"
            >
              <a-select-option value="png">PNG</a-select-option>
              <a-select-option value="jpg">JPG</a-select-option>
              <a-select-option value="ico">ICO (Windows Icon)</a-select-option>
              <a-select-option value="icns">ICNS (macOS Icon)</a-select-option>
            </a-select>
          </div>

          <div
            class="setting-row"
            v-if="['png', 'jpg'].includes(targetFormat) && originalWidth > 0"
            style="align-items: flex-start"
          >
            <label style="margin-top: 6px">图片尺寸</label>
            <div class="size-settings">
              <a-radio-group
                v-model:value="resizeMode"
                button-style="solid"
                class="size-mode-radio"
              >
                <a-radio-button value="original">
                  原图
                  <span class="dim-text"
                    >({{ originalWidth }}×{{ originalHeight }})</span
                  >
                </a-radio-button>
                <a-radio-button value="custom">自定义</a-radio-button>
              </a-radio-group>

              <div v-if="resizeMode === 'custom'" class="custom-size-inputs">
                <a-input-number
                  v-model:value="customWidth"
                  :min="1"
                  :precision="0"
                  size="middle"
                  :controls="false"
                  class="size-input"
                  @change="handleWidthChange"
                >
                  <template #addonAfter>W</template>
                </a-input-number>
                <span class="size-separator">×</span>
                <a-input-number
                  v-model:value="customHeight"
                  :min="1"
                  :precision="0"
                  :controls="false"
                  size="middle"
                  class="size-input"
                  @change="handleHeightChange"
                >
                  <template #addonAfter>H</template>
                </a-input-number>

                <a-tooltip
                  :title="lockAspectRatio ? '已锁定纵横比' : '纵横比未锁定'"
                >
                  <a-button
                    type="text"
                    class="lock-btn"
                    :class="{ active: lockAspectRatio }"
                    @click="lockAspectRatio = !lockAspectRatio"
                  >
                    <LockOutlined v-if="lockAspectRatio" />
                    <UnlockOutlined v-else />
                  </a-button>
                </a-tooltip>
              </div>
            </div>
          </div>

          <div class="setting-row" v-if="targetFormat === 'jpg'">
            <div class="info-alert">
              <InfoCircleOutlined /> JPG 不支持透明背景，将自动填充白色背景。
            </div>
          </div>

          <div
            class="setting-row"
            v-if="['ico', 'icns'].includes(targetFormat)"
          >
            <label>图标尺寸</label>
            <div class="size-info">
              <a-tag color="blue">{{
                targetFormat === "ico" ? "256x256" : "512x512"
              }}</a-tag>
              <span>自动调整</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted, watch } from "vue";
import {
  CloudUploadOutlined,
  DeleteOutlined,
  SwapOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  DownOutlined,
  FileImageOutlined,
  CloseOutlined,
  SettingOutlined,
  ArrowRightOutlined,
  FolderOpenOutlined,
  LinkOutlined,
  LockOutlined,
  UnlockOutlined,
} from "@ant-design/icons-vue";
import { message } from "ant-design-vue";

const fileInput = ref<HTMLInputElement | null>(null);
const sourceFile = ref<File | null>(null);
const previewUrl = ref("");
const targetFormat = ref("png");
const converting = ref(false);
const isDragOver = ref(false);
const isSettingsOpen = ref(true);

// Resize related
const resizeMode = ref("original"); // 'original', 'custom'
const originalWidth = ref(0);
const originalHeight = ref(0);
const customWidth = ref(0);
const customHeight = ref(0);
const lockAspectRatio = ref(true);

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

const handleWidthChange = (val: number | null) => {
  if (val === null) return;
  if (lockAspectRatio.value && originalWidth.value > 0) {
    const ratio = originalHeight.value / originalWidth.value;
    customHeight.value = Math.round(val * ratio);
  }
};

const handleHeightChange = (val: number | null) => {
  if (val === null) return;
  if (lockAspectRatio.value && originalHeight.value > 0) {
    const ratio = originalWidth.value / originalHeight.value;
    customWidth.value = Math.round(val * ratio);
  }
};

// URL Modal
const urlModalVisible = ref(false);
const urlInput = ref("");

const showUrlModal = () => {
  urlModalVisible.value = true;
  urlInput.value = "";
};

const handleUrlSubmit = async () => {
  if (!urlInput.value) {
    message.warning("请输入网址");
    return;
  }

  const hide = message.loading("正在加载远程图片...", 0);
  try {
    const response = await fetch(urlInput.value);
    if (!response.ok) throw new Error("网络请求失败");

    const blob = await response.blob();
    // Try to guess filename from URL
    const filename =
      urlInput.value.split("/").pop()?.split("?")[0] || "remote-image";
    const file = new File([blob], filename, { type: blob.type });

    processFile(file);
    urlModalVisible.value = false;
    hide();
    message.success("图片加载成功");
  } catch (e) {
    hide();
    message.error("加载失败，请检查网址或跨域设置");
  }
};

const toggleSettings = () => {
  isSettingsOpen.value = !isSettingsOpen.value;
};

const triggerUpload = () => {
  fileInput.value?.click();
};

const handleFileSelect = (e: Event) => {
  const files = (e.target as HTMLInputElement).files;
  if (files && files.length > 0) {
    processFile(files[0]);
  }
};

const handleDrop = (e: DragEvent) => {
  isDragOver.value = false;
  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    processFile(files[0]);
  }
};

const processFile = (file: File) => {
  if (!file.type.startsWith("image/") && !file.name.endsWith(".svg")) {
    message.error("请上传有效的图片文件");
    return;
  }

  if (file.size > 1024 * 1024 * 1024) {
    // 1GB limit as per UI hint
    message.error("文件过大");
    return;
  }

  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }

  sourceFile.value = file;
  previewUrl.value = URL.createObjectURL(file);

  // Get image dimensions
  loadImage(previewUrl.value)
    .then((img) => {
      originalWidth.value = img.width;
      originalHeight.value = img.height;
      customWidth.value = img.width;
      customHeight.value = img.height;
      resizeMode.value = "original";
    })
    .catch((e) => {
      console.error("Failed to load image for dimensions", e);
    });
};

const clearFile = () => {
  sourceFile.value = null;
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = "";
  }
  if (fileInput.value) {
    fileInput.value.value = "";
  }
  originalWidth.value = 0;
  originalHeight.value = 0;
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const toHexLE = (num: number, bytes: number) => {
  let hex = "";
  for (let i = 0; i < bytes; i++) {
    hex += ((num >> (i * 8)) & 0xff).toString(16).padStart(2, "0");
  }
  return hex;
};

const toHexBE = (num: number, bytes: number) => {
  let hex = "";
  for (let i = bytes - 1; i >= 0; i--) {
    hex += ((num >> (i * 8)) & 0xff).toString(16).padStart(2, "0");
  }
  return hex;
};

const hexToBytes = (hex: string) => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
};

const convert = async () => {
  if (!sourceFile.value) return;
  converting.value = true;
  const hideLoading = message.loading("正在转换图片...", 0);

  try {
    await new Promise((r) => setTimeout(r, 800));

    const img = await loadImage(previewUrl.value);
    const canvas = document.createElement("canvas");
    let width = img.width;
    let height = img.height;

    // Resize logic
    if (targetFormat.value === "ico") {
      width = 256;
      height = 256;
    } else if (targetFormat.value === "icns") {
      width = 512;
      height = 512;
    } else if (
      resizeMode.value === "custom" &&
      customWidth.value > 0 &&
      customHeight.value > 0
    ) {
      width = customWidth.value;
      height = customHeight.value;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context failed");

    ctx.clearRect(0, 0, width, height);

    if (targetFormat.value === "jpg") {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);
    }

    ctx.drawImage(img, 0, 0, width, height);

    let resultBlob: Blob | null = null;
    const originalName = sourceFile.value.name;
    const nameWithoutExt =
      originalName.substring(0, originalName.lastIndexOf(".")) || originalName;
    const filename = `${nameWithoutExt}.${targetFormat.value}`;

    if (targetFormat.value === "jpg") {
      resultBlob = await new Promise((r) =>
        canvas.toBlob(r, "image/jpeg", 0.9)
      );
    } else if (targetFormat.value === "png") {
      resultBlob = await new Promise((r) => canvas.toBlob(r, "image/png"));
    } else if (targetFormat.value === "ico") {
      const pngBlob = await new Promise<Blob | null>((r) =>
        canvas.toBlob(r, "image/png")
      );
      if (!pngBlob) throw new Error("PNG gen failed");
      const pngData = new Uint8Array(await pngBlob.arrayBuffer());
      const fileSize = pngData.length;
      const header = hexToBytes("000001000100");
      const w = width >= 256 ? 0 : width;
      const h = height >= 256 ? 0 : height;
      const entry = hexToBytes(
        [
          toHexLE(w, 1),
          toHexLE(h, 1),
          "00",
          "00",
          "0100",
          "2000",
          toHexLE(fileSize, 4),
          toHexLE(22, 4),
        ].join("")
      );
      resultBlob = new Blob([header, entry, pngData], { type: "image/x-icon" });
    } else if (targetFormat.value === "icns") {
      const pngBlob = await new Promise<Blob | null>((r) =>
        canvas.toBlob(r, "image/png")
      );
      if (!pngBlob) throw new Error("PNG gen failed");
      const pngData = new Uint8Array(await pngBlob.arrayBuffer());
      const type = width === 512 ? "ic09" : "ic08";
      const fileLen = 8 + 8 + pngData.length;
      const headerText = new TextEncoder().encode("icns");
      const headerLen = hexToBytes(toHexBE(fileLen, 4));
      const iconType = new TextEncoder().encode(type);
      const iconLenBytes = hexToBytes(toHexBE(8 + pngData.length, 4));
      resultBlob = new Blob(
        [headerText, headerLen, iconType, iconLenBytes, pngData],
        { type: "image/icns" }
      );
    }

    if (resultBlob) {
      const url = URL.createObjectURL(resultBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      hideLoading();
      message.success(`转换成功！已下载 ${filename}`);
    } else {
      throw new Error("Blob generation failed");
    }
  } catch (e: any) {
    console.error(e);
    hideLoading();
    message.error("转换失败: " + e.message);
  } finally {
    converting.value = false;
  }
};

onUnmounted(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
});
</script>

<style scoped>
.tool-content {
  display: flex;
  flex-direction: column;
  padding: 24px 24px 40px;
  max-width: 900px;
  margin: 0 auto;
  color: var(--text-primary, #1f1f1f);
}

.header {
  margin-bottom: 32px;
  text-align: center;
}

.header h2 {
  font-size: 28px;
  color: var(--text-primary, #1f1f1f);
  margin-bottom: 8px;
}

.subtitle {
  color: var(--text-secondary, #666);
  font-size: 16px;
}

.converter-workspace {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Upload Box */
.upload-box {
  background: var(
    --upload-box-bg,
    #f0f2f5
  ); /* Light gray background like screenshot */
  border: 2px dashed #9d9db5;
  border-radius: 8px;
  padding: 60px 20px;
  text-align: center;
  transition: all 0.3s;
  cursor: pointer;
  position: relative;
}

.upload-box:hover,
.upload-box.is-dragover {
  background: var(--upload-box-hover-bg, #e6f7ff);
  border-color: var(--brand-primary, #1890ff);
}

.upload-box.has-file {
  padding: 40px;
  background: var(--sidebar-bg, #fff);
  border-style: solid;
  cursor: default;
  border-color: var(--border-color-base, #f0f0f0);
}

.upload-btn-group {
  display: inline-flex;
  align-items: center;
  background: #6c5ce7;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(108, 92, 231, 0.2);
  transition: transform 0.1s;
}

.upload-btn-group:hover {
  transform: translateY(-1px);
  background: #5f4dd0;
}

.upload-btn-main {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  color: white;
  font-size: 18px;
  font-weight: 500;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
}

.upload-btn-arrow {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  color: white;
  cursor: pointer;
}

.upload-btn-arrow:hover {
  background: rgba(0, 0, 0, 0.1);
}

.plus-icon {
  margin-right: 8px;
}

.upload-hint {
  margin-top: 16px;
  color: var(--text-secondary, #666);
  font-size: 14px;
}

.upload-hint a,
.terms-hint a {
  color: #6c5ce7;
  text-decoration: none;
}

.terms-hint {
  margin-top: 8px;
  color: var(--text-secondary, #999);
  font-size: 12px;
}

/* File Preview Card */
.file-preview-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--card-bg, #fff);
  padding: 16px;
  border: 1px solid var(--border-color-base, #eee);
  border-radius: 8px;
  max-width: 400px;
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.file-icon {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  background: var(--bg-layout, #f5f5f5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #999;
  overflow: hidden;
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  text-align: left;
}

.file-name {
  font-weight: 500;
  color: var(--text-primary, #333);
}

.file-size {
  font-size: 12px;
  color: var(--text-secondary, #999);
}

.remove-btn {
  color: var(--text-secondary, #999);
}

.remove-btn:hover {
  color: #ff4d4f;
}

/* Settings Accordion */
.settings-container {
  background: var(--card-bg, #fff);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
  overflow: hidden;
  border: 1px solid var(--border-color-base, #f0f0f0);
}

.accordion-header {
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  background: var(--card-bg, #fff);
  transition: background 0.2s;
}

.accordion-header:hover {
  background: var(--hover-bg, #f9f9f9);
}

.accordion-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--text-primary, #333);
}

.accordion-arrow {
  transition: transform 0.3s;
  color: var(--text-secondary, #999);
}

.accordion-arrow.open {
  transform: rotate(180deg);
}

.accordion-content {
  padding: 24px;
  border-top: 1px solid var(--border-color-base, #f0f0f0);
  background: var(--accordion-content-bg, #fafafa);
}

.setting-row {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.setting-row label {
  width: 80px;
  font-weight: 500;
  color: var(--text-secondary, #666);
}

.info-alert {
  margin-left: 116px;
  color: #faad14;
  font-size: 13px;
}

.size-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary, #666);
  font-size: 13px;
}

.size-settings {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.custom-size-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.size-input {
  width: 110px;
}

.size-separator {
  color: var(--text-secondary, #999);
}

.lock-btn {
  color: var(--text-secondary, #999);
}

.lock-btn.active {
  color: var(--brand-primary);
}

/* Radio Button Styles */
.size-mode-radio :deep(.ant-radio-button-wrapper) {
  background: var(--card-bg, #fff);
  border-color: var(--border-color-base, #d9d9d9);
  color: var(--text-primary, rgba(0, 0, 0, 0.85));
  white-space: nowrap;
  width: 130px;
}

.size-mode-radio :deep(.ant-radio-button-wrapper:hover) {
  color: #6c5ce7;
  border-color: #6c5ce7;
}

.size-mode-radio :deep(.ant-radio-button-wrapper-checked) {
  background: #6c5ce7;
  border-color: #6c5ce7;
  color: #fff !important;
  box-shadow: -1px 0 0 0 #6c5ce7;
  z-index: 1;
}

.size-mode-radio :deep(.ant-radio-button-wrapper-checked:hover) {
  background: #5f4dd0;
  border-color: #5f4dd0;
  color: #fff !important;
  box-shadow: -1px 0 0 0 #5f4dd0;
}

.size-mode-radio :deep(.ant-radio-button-wrapper-checked::before) {
  background-color: #5f4dd0 !important;
}

.dim-text {
  font-size: 12px;
  opacity: 0.7;
  margin-left: 4px;
}

/* Action Bar */
.action-bar {
  text-align: center;
  margin-top: 16px;
}

.convert-btn {
  background: #6c5ce7;
  border-color: #6c5ce7;
  height: 50px;
  padding: 0 40px;
  font-size: 16px;
  border-radius: 8px;
  color: white;
}

.convert-btn:hover {
  background: #5f4dd0;
  border-color: #5f4dd0;
}

/* Dark Mode Overrides */
:global(html[data-dark-mode="true"]) .tool-content {
  --upload-box-bg: rgba(255, 255, 255, 0.02);
  --upload-box-hover-bg: rgba(255, 255, 255, 0.05);
  --card-bg: var(--sidebar-bg);
  --hover-bg: rgba(255, 255, 255, 0.05);
  --accordion-content-bg: rgba(0, 0, 0, 0.2);
}
</style>
