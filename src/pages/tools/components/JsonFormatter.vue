<template>
  <div class="tool-content">
    <div class="header">
      <h2>JSON 格式化</h2>
      <p class="subtitle">格式化、压缩和校验 JSON 数据</p>
    </div>

    <div class="workspace">
      <div class="editor-pane">
        <div class="pane-header">
          <span>输入</span>
          <div class="pane-actions">
            <a-button type="text" size="small" @click="clearJson" danger>
              <template #icon><DeleteOutlined /></template>
              清空
            </a-button>
          </div>
        </div>
        <a-textarea
          v-model:value="jsonInput"
          placeholder="在此粘贴 JSON 字符串..."
          class="code-editor input-editor"
          :bordered="false"
        />
      </div>

      <div class="actions-bar">
        <a-button type="primary" @click="formatJson">
          <template #icon><AlignLeftOutlined /></template>
          格式化
        </a-button>
        <a-button @click="compressJson">
          <template #icon><CompressOutlined /></template>
          压缩
        </a-button>
      </div>

      <div class="editor-pane">
        <div class="pane-header">
          <span>结果</span>
          <div class="pane-actions">
            <a-button
              type="text"
              size="small"
              @click="copyResult"
              :disabled="!jsonOutput"
            >
              <template #icon><CopyOutlined /></template>
              复制
            </a-button>
          </div>
        </div>
        <a-textarea
          v-model:value="jsonOutput"
          readonly
          class="code-editor output-editor"
          placeholder="处理结果将显示在这里"
          :bordered="false"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  CodeOutlined,
  DeleteOutlined,
  AlignLeftOutlined,
  CompressOutlined,
  CopyOutlined,
} from "@ant-design/icons-vue";
import { message } from "ant-design-vue";

const jsonInput = ref("");
const jsonOutput = ref("");

const formatJson = () => {
  if (!jsonInput.value.trim()) return;
  try {
    const obj = JSON.parse(jsonInput.value);
    jsonOutput.value = JSON.stringify(obj, null, 2);
    message.success("格式化成功");
  } catch (e) {
    message.error("无效的 JSON 格式");
  }
};

const compressJson = () => {
  if (!jsonInput.value.trim()) return;
  try {
    const obj = JSON.parse(jsonInput.value);
    jsonOutput.value = JSON.stringify(obj);
    message.success("压缩成功");
  } catch (e) {
    message.error("无效的 JSON 格式");
  }
};

const clearJson = () => {
  jsonInput.value = "";
  jsonOutput.value = "";
};

const copyResult = () => {
  if (!jsonOutput.value) return;
  navigator.clipboard.writeText(jsonOutput.value).then(() => {
    message.success("已复制到剪贴板");
  });
};
</script>

<style scoped>
.tool-content {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px;
  background: var(--card-bg, #fff);
  height: auto;
}

.header {
  margin-bottom: 24px;
  /* text-align: center; */
}

.header h2 {
  text-align: center;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  color: var(--text-primary, #1f1f1f);
}

.subtitle {
  margin-top: 8px;
  color: var(--text-secondary, #8c8c8c);
}

.workspace {
  flex: 1;
  display: flex;
  gap: 16px;
  /* Removed min-height: 0 */
}

.editor-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color-base, #d9d9d9);
  border-radius: 8px;
  /* Removed overflow: hidden */
  transition: border-color 0.2s;
  min-height: 500px;
}

.editor-pane:focus-within {
  border-color: var(--brand-primary, #1890ff);
}

.pane-header {
  height: 40px;
  background: var(--bg-layout, #fafafa);
  border-bottom: 1px solid var(--border-color-base, #f0f0f0);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px;
  font-size: 13px;
  color: var(--text-secondary, #595959);
  font-weight: 500;
}

.code-editor {
  flex: 1;
  font-family: "Fira Code", "Consolas", monospace;
  font-size: 13px;
  line-height: 1.6;
  resize: vertical !important;
  padding: 12px;
  background: var(--card-bg, #fff);
  color: var(--text-primary, #1f1f1f);
  min-height: 400px;
}

.output-editor {
  background: var(--bg-layout, #fafafa);
}

.actions-bar {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  padding: 0 8px;
}

/* Dark Mode Overrides */
:global(html[data-dark-mode="true"]) .tool-content {
  --card-bg: var(--sidebar-bg);
  --bg-layout: rgba(255, 255, 255, 0.05);
}
</style>
