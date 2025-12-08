<template>
  <el-card>
    <template #header>AI聊天</template>
    <el-form inline>
      <el-form-item label="Base URL">
        <el-input v-model="baseUrl" size="small" />
      </el-form-item>
      <el-form-item label="API Key">
        <el-input v-model="apiKey" type="password" size="small" />
      </el-form-item>
      <el-form-item label="Model">
        <el-input v-model="model" size="small" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="small" @click="saveConfig">保存</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="12" style="margin-top:12px">
      <el-col :span="24">
        <el-card shadow="never">
          <el-scrollbar height="58vh" ref="listEl">
            <el-space direction="vertical" style="width:100%">
              <el-card v-for="(m, i) in messages" :key="i" :class="m.role" shadow="never">
                <div class="content">{{ m.content }}</div>
              </el-card>
            </el-space>
          </el-scrollbar>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="never" style="margin-top:12px">
      <el-input v-model="input" type="textarea" :rows="3" placeholder="输入你的问题..." />
      <el-space style="margin-top:8px; justify-content:flex-end; width:100%">
        <el-button :disabled="loading || !input.trim()" type="primary" @click="send">发送</el-button>
        <el-button :disabled="loading" @click="clear">清空</el-button>
      </el-space>
    </el-card>
  </el-card>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import { ElMessage } from "element-plus";

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
  ElMessage.success("配置已保存");
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
    ElMessage.warning("请先填写 Base URL / API Key / Model");
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
.user .content { background: var(--sidebar-active-bg); color: var(--sidebar-active-text); padding: 8px 10px; border-radius: 8px; }
.assistant .content { background: #fff; color: #333; padding: 8px 10px; border-radius: 8px; }
.content { white-space: pre-wrap; word-break: break-word; }
</style>
