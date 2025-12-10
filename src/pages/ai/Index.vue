<template>
  <a-card title="AI聊天">
    <a-form layout="inline">
      <a-form-item label="Base URL">
        <a-input v-model:value="baseUrl" size="small" />
      </a-form-item>
      <a-form-item label="API Key">
        <a-input v-model:value="apiKey" type="password" size="small" />
      </a-form-item>
      <a-form-item label="Model">
        <a-input v-model:value="model" size="small" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" size="small" @click="saveConfig"
          >保存</a-button
        >
      </a-form-item>
    </a-form>

    <a-row :gutter="12" style="margin-top: 12px">
      <a-col :span="24">
        <a-card :bordered="false" class="chat-container-card">
          <div class="chat-list" ref="listEl">
            <a-space direction="vertical" style="width: 100%">
              <a-card
                v-for="(m, i) in messages"
                :key="i"
                :class="m.role"
                :bordered="false"
                size="small"
              >
                <div class="content">{{ m.content }}</div>
              </a-card>
            </a-space>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <a-card :bordered="false" style="margin-top: 12px">
      <a-textarea
        v-model:value="input"
        :rows="3"
        placeholder="输入你的问题..."
      />
      <a-space style="margin-top: 8px; justify-content: flex-end; width: 100%">
        <a-button
          :disabled="loading || !input.trim()"
          type="primary"
          @click="send"
          >发送</a-button
        >
        <a-button :disabled="loading" @click="clear">清空</a-button>
      </a-space>
    </a-card>
  </a-card>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import { message } from "ant-design-vue";

type ChatMsg = { role: "user" | "assistant"; content: string };

const baseUrl = ref(
  localStorage.getItem("ai:baseUrl") || "https://api.openai.com/v1"
);
const apiKey = ref(localStorage.getItem("ai:apiKey") || "");
const model = ref(localStorage.getItem("ai:model") || "gpt-4o-mini");
const messages = ref<ChatMsg[]>([]);
const input = ref("");
const loading = ref(false);
const listEl = ref<HTMLElement | null>(null);

const saveConfig = () => {
  localStorage.setItem("ai:baseUrl", baseUrl.value);
  localStorage.setItem("ai:apiKey", apiKey.value);
  localStorage.setItem("ai:model", model.value);
  message.success("配置已保存");
};

const scrollToBottom = async () => {
  await nextTick();
  const el = listEl.value;
  if (el) el.scrollTop = el.scrollHeight;
};

const callModel = async (history: ChatMsg[]) => {
  const url = baseUrl.value.replace(/\/$/, "") + "/chat/completions";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey.value}`,
    },
    body: JSON.stringify({
      model: model.value,
      messages: history.map((m) => ({ role: m.role, content: m.content })),
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "";
};

const send = async () => {
  if (!baseUrl.value || !apiKey.value || !model.value) {
    message.warning("请先填写 Base URL / API Key / Model");
    return;
  }
  const text = input.value.trim();
  if (!text) return;
  loading.value = true;
  messages.value.push({ role: "user", content: text });
  input.value = "";
  await scrollToBottom();
  try {
    const reply = await callModel(messages.value);
    messages.value.push({ role: "assistant", content: reply || "（空响应）" });
  } catch (e: any) {
    messages.value.push({
      role: "assistant",
      content: `错误：${e?.message || e}`,
    });
  } finally {
    loading.value = false;
    await scrollToBottom();
  }
};

const clear = () => {
  messages.value = [];
};
</script>

<style scoped>
.chat-container-card {
  border: 1px solid #f0f0f0;
}
.chat-list {
  height: 58vh;
  overflow-y: auto;
  padding: 10px;
}
.user .content {
  background: var(--sidebar-active-bg);
  color: var(--sidebar-active-text);
  padding: 8px 10px;
  border-radius: 8px;
}
.assistant .content {
  background: #f5f5f5;
  color: #333;
  padding: 8px 10px;
  border-radius: 8px;
}
.content {
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
