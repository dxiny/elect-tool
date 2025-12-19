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
          <div class="search-box">
             <a-input-search
              v-model:value="searchText"
              placeholder="搜索..."
              style="width: 150px"
              size="small"
              @search="handleSearch"
              @keyup.enter="handleSearch"
            />
            <span v-if="searchResult.count > 0" class="search-info">
              {{ searchResult.current }}/{{ searchResult.count }}
            </span>
            <div v-if="searchResult.count > 0" class="search-nav">
              <a-button type="text" size="small" @click="prevMatch"><UpOutlined /></a-button>
              <a-button type="text" size="small" @click="nextMatch"><DownOutlined /></a-button>
            </div>
          </div>
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
        <div class="editor-wrapper" ref="outputWrapper">
          <textarea
            ref="outputRef"
            v-model="jsonOutput"
            readonly
            class="code-editor output-editor native-textarea"
            placeholder="处理结果将显示在这里"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from "vue";
import {
  CodeOutlined,
  DeleteOutlined,
  AlignLeftOutlined,
  CompressOutlined,
  CopyOutlined,
  UpOutlined,
  DownOutlined
} from "@ant-design/icons-vue";
import { message } from "ant-design-vue";

const jsonInput = ref("");
const jsonOutput = ref("");
const searchText = ref("");
const outputRef = ref<HTMLTextAreaElement | null>(null);
const searchResult = reactive({
  indices: [] as number[],
  current: 0,
  count: 0
});

const formatJson = () => {
  if (!jsonInput.value.trim()) return;
  try {
    const obj = JSON.parse(jsonInput.value);
    jsonOutput.value = JSON.stringify(obj, null, 2);
    message.success("格式化成功");
    clearSearch();
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
    clearSearch();
  } catch (e) {
    message.error("无效的 JSON 格式");
  }
};

const clearJson = () => {
  jsonInput.value = "";
  jsonOutput.value = "";
  clearSearch();
};

const copyResult = () => {
  if (!jsonOutput.value) return;
  navigator.clipboard.writeText(jsonOutput.value).then(() => {
    message.success("已复制到剪贴板");
  });
};

// Search Logic
const clearSearch = () => {
  searchText.value = "";
  searchResult.indices = [];
  searchResult.current = 0;
  searchResult.count = 0;
};

const handleSearch = () => {
  if (!jsonOutput.value || !searchText.value) {
    searchResult.indices = [];
    searchResult.count = 0;
    searchResult.current = 0;
    return;
  }

  const text = jsonOutput.value;
  const query = searchText.value;
  const indices: number[] = [];
  let index = text.indexOf(query);

  while (index !== -1) {
    indices.push(index);
    index = text.indexOf(query, index + 1);
  }

  searchResult.indices = indices;
  searchResult.count = indices.length;
  
  if (indices.length > 0) {
    searchResult.current = 1;
    highlightMatch(indices[0]);
  } else {
    searchResult.current = 0;
    message.info("未找到匹配项");
  }
};

const nextMatch = () => {
  if (searchResult.count === 0) return;
  searchResult.current = searchResult.current >= searchResult.count ? 1 : searchResult.current + 1;
  highlightMatch(searchResult.indices[searchResult.current - 1]);
};

const prevMatch = () => {
  if (searchResult.count === 0) return;
  searchResult.current = searchResult.current <= 1 ? searchResult.count : searchResult.current - 1;
  highlightMatch(searchResult.indices[searchResult.current - 1]);
};

const highlightMatch = (index: number) => {
  const textarea = outputRef.value;
  if (!textarea) return;

  textarea.focus();
  textarea.setSelectionRange(index, index + searchText.value.length);
  
  // Calculate scroll position
  // Simple approach: blur and focus triggers auto scroll in most browsers
  // Or calculate line number
  const textBefore = jsonOutput.value.substring(0, index);
  const lineNum = textBefore.split('\n').length;
  const lineHeight = 21; // Approximate line height based on font-size 13px * 1.6
  const scrollTop = (lineNum - 1) * lineHeight;
  
  // Center the match
  textarea.scrollTop = Math.max(0, scrollTop - textarea.clientHeight / 2);
};

</script>

<style scoped>
/* ... existing styles ... */
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

.native-textarea {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  resize: none;
}

.editor-wrapper {
  flex: 1;
  display: flex;
  min-height: 400px;
}

.actions-bar {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  padding: 0 8px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: auto; /* Push to left near title or adjust as needed */
  margin-left: 16px;
}

.search-info {
  font-size: 12px;
  color: #888;
  min-width: 40px;
  text-align: center;
}

.search-nav {
  display: flex;
  gap: 2px;
}

/* Dark Mode Overrides */
:global(html[data-dark-mode="true"]) .tool-content {
  --card-bg: var(--sidebar-bg);
  --bg-layout: rgba(255, 255, 255, 0.05);
}
</style>
