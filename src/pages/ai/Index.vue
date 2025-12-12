<template>
  <div class="ai-page-container">
    <div class="ai-chat-area">
      <div v-if="messages.length === 0" class="welcome-screen">
        <div class="welcome-header">
          <div class="welcome-logo">
            <img style="width: 50px" :src="logo" alt="logo" />
          </div>
          <h1 class="welcome-title">ElectTool AI</h1>
          <p class="welcome-subtitle">问出你的疑惑</p>
        </div>
      </div>

      <div v-else class="chat-list" ref="listEl">
        <div v-for="(group, i) in chatGroups" :key="i" class="chat-group">
          <!-- User Question (Sticky) -->
          <div class="message-wrapper user">
            <div class="avatar">
              <img src="@/assets/images/avatar.jpg" />
            </div>
            <div class="message-content">
              <div class="bubble">
                {{ group.user.content }}
              </div>
            </div>
          </div>

          <!-- Assistant Answer -->
          <div v-if="group.assistant" class="message-wrapper assistant">
            <div class="avatar">
              <div class="ai-avatar">
                <img style="width: 50px" :src="logo" alt="logo" />
              </div>
            </div>
            <div class="message-content">
              <div class="bubble">
                {{ group.assistant.content }}
              </div>
            </div>
          </div>

          <!-- Loading State (if this is the last group and loading) -->
          <div
            v-if="loading && i === chatGroups.length - 1 && !group.assistant"
            class="message-wrapper assistant"
          >
            <div class="avatar">
              <div class="ai-avatar">
                <img style="width: 50px" :src="logo" alt="logo" />
              </div>
            </div>
            <div class="message-content">
              <div class="bubble loading-bubble">
                <loading-outlined /> Thinking...
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="input-area">
        <div class="input-wrapper">
          <a-textarea
            v-model:value="input"
            :rows="2"
            :auto-size="{ minRows: 1, maxRows: 5 }"
            placeholder="在此输入问题"
            class="chat-input"
            @keydown.enter.prevent="handleEnter"
          />
          <div class="input-actions">
            <a-button disabled type="text" shape="circle" class="action-btn">
              <template #icon><audio-outlined /></template>
            </a-button>
            <a-button
              type="text"
              shape="circle"
              class="action-btn send-btn"
              :disabled="loading"
              @click="send"
            >
              <template #icon><send-outlined /></template>
            </a-button>
          </div>
        </div>
      </div>
    </div>

    <div class="ai-sidebar-right" :class="{ collapsed: isHistoryCollapsed }">
      <!-- Collapse Button (Always visible) -->
      <div
        class="collapse-btn"
        @click="toggleHistory"
        :title="isHistoryCollapsed ? '展开历史' : '收起历史'"
      >
        <left-outlined v-if="isHistoryCollapsed" />
        <right-outlined v-else />
      </div>

      <div class="sidebar-content" v-show="!isHistoryCollapsed">
        <div class="history-header">
          <span>会话历史</span>
          <span class="history-count">{{ sessions.length }}</span>
          <more-outlined class="more-options" />
        </div>

        <div class="history-list">
          <div
            v-for="session in sessions"
            :key="session.id"
            class="history-item"
            :class="{ active: currentSessionId === session.id }"
            @click="switchSession(session.id)"
          >
            <message-outlined class="item-icon" />
            <div class="history-title">{{ session.title }}</div>
            <div class="history-meta" v-if="session.messages.length > 0">
              {{ session.messages.length }}
            </div>
          </div>
          <div v-if="sessions.length === 0" class="empty-history">
            No history yet
          </div>
        </div>

        <div class="new-chat-wrapper">
          <button class="new-chat-btn-full" @click="startNewChat">
            <plus-outlined /> 新建对话
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, watch, computed } from "vue";
import logo from "@/assets/images/logo.png";
import { message } from "ant-design-vue";
import {
  getSessions,
  createSession,
  updateSession,
  deleteSession,
  type Session,
  type ChatMsg,
} from "@/api/ai";
import {
  RobotOutlined,
  SendOutlined,
  LoadingOutlined,
  BulbOutlined,
  ThunderboltOutlined,
  WarningOutlined,
  MessageOutlined,
  SearchOutlined,
  CustomerServiceOutlined,
  SettingOutlined,
  LogoutOutlined,
  AudioOutlined,
  MoreOutlined,
  PlusOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons-vue";

// DeepSeek Configuration
const CONFIG = {
  provider: "deepseek",
  baseUrl: "https://api.deepseek.com",
  apiKey: "sk-3726f7c8bf3d43308c25a6b72959a1e9",
  model: "deepseek-chat",
};

// Removed local type definitions as they are imported from API

const sessions = ref<Session[]>([]);
const currentSessionId = ref<string>("");
const messages = ref<ChatMsg[]>([]);
const input = ref("");
const loading = ref(false);
const listEl = ref<HTMLElement | null>(null);
const isHistoryCollapsed = ref(false);

const chatGroups = computed(() => {
  const groups = [];
  let currentGroup: { user: ChatMsg; assistant?: ChatMsg } | null = null;

  messages.value.forEach((msg) => {
    if (msg.role === "user") {
      if (currentGroup) groups.push(currentGroup);
      currentGroup = { user: msg };
    } else if (msg.role === "assistant" && currentGroup) {
      currentGroup.assistant = msg;
    }
  });

  if (currentGroup) groups.push(currentGroup);
  return groups;
});

// Load sessions from API
onMounted(async () => {
  try {
    const res = await getSessions();
    if (res.success && res.data) {
      let serverSessions = res.data;

      // Migration: If server is empty but local has data, migrate it
      const localData = localStorage.getItem("ai:sessions");
      if (localData && serverSessions.length === 0) {
        try {
          const localSessions: Session[] = JSON.parse(localData);
          if (localSessions.length > 0) {
            // Migrate all sessions
            await Promise.all(localSessions.map((s) => createSession(s)));

            // Reload from server
            const newRes = await getSessions();
            if (newRes.success && newRes.data) {
              serverSessions = newRes.data;
            }
            localStorage.removeItem("ai:sessions"); // Clear local after migration
            message.success("已将本地历史同步至云端");
          }
        } catch (err) {
          console.error("Migration failed", err);
        }
      }

      sessions.value = serverSessions;
      // Backend should sort, but we can ensure sort here too
      sessions.value.sort((a, b) => b.updatedAt - a.updatedAt);

      if (sessions.value.length > 0) {
        switchSession(sessions.value[0].id);
      } else {
        startNewChat();
      }
    } else {
      startNewChat();
    }
  } catch (e) {
    console.error("Failed to load sessions", e);
    startNewChat();
  }
});

// Removed localStorage watch

const startNewChat = () => {
  const newId = Date.now().toString();
  const newSession: Session = {
    id: newId,
    title: "New Chat",
    messages: [],
    updatedAt: Date.now(),
  };
  sessions.value.unshift(newSession);
  currentSessionId.value = newId;
  messages.value = newSession.messages; // Ensure reference linkage

  // Persist new session
  createSession(newSession);
};

const switchSession = (id: string) => {
  const session = sessions.value.find((s) => s.id === id);
  if (session) {
    currentSessionId.value = id;
    messages.value = session.messages;
    scrollToBottom();
  }
};

const scrollToBottom = async () => {
  await nextTick();
  const el = listEl.value;
  if (el) el.scrollTop = el.scrollHeight;
};

const callModel = async (history: ChatMsg[]) => {
  const url = CONFIG.baseUrl.replace(/\/$/, "") + "/chat/completions";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CONFIG.apiKey}`,
    },
    body: JSON.stringify({
      model: CONFIG.model,
      messages: history.map((m) => ({ role: m.role, content: m.content })),
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  const fullContent = data?.choices?.[0]?.message?.content || "";
  return fullContent;
};

const typeWriterEffect = async (fullText: string, session: Session) => {
  const assistantMsg = session.messages[session.messages.length - 1];
  assistantMsg.content = ""; // Start empty

  const chunkSize = 5; // Characters per tick
  let currentIndex = 0;

  return new Promise<void>((resolve) => {
    const interval = setInterval(() => {
      if (currentIndex >= fullText.length) {
        clearInterval(interval);
        resolve();
        return;
      }

      const nextChunk = fullText.slice(currentIndex, currentIndex + chunkSize);
      assistantMsg.content += nextChunk;
      currentIndex += chunkSize;
      scrollToBottom();
    }, 15); // Adjust speed here (lower is faster)
  });
};

const updateSessionTitle = (session: Session, firstMessage: string) => {
  if (session.title === "New Chat") {
    session.title =
      firstMessage.slice(0, 20) + (firstMessage.length > 20 ? "..." : "");
    // Title changed, persist update
    updateSession(session.id, session);
  }
};

const handleEnter = (e: KeyboardEvent) => {
  if (!e.shiftKey) {
    send();
  }
};

const quickAsk = (text: string) => {
  input.value = text;
  send();
};

const send = async () => {
  const text = input.value.trim();
  if (!text || loading.value) return;

  loading.value = true;

  let session = sessions.value.find((s) => s.id === currentSessionId.value);
  if (!session) {
    startNewChat();
    session = sessions.value[0];
  }

  if (session.messages.length === 0) {
    updateSessionTitle(session, text);
  }

  const userMsg: ChatMsg = { role: "user", content: text };
  session.messages.push(userMsg);
  session.updatedAt = Date.now();
  // Persist user message
  await updateSession(session.id, session);

  input.value = "";
  await scrollToBottom();

  try {
    const reply = await callModel(session.messages);
    // Add placeholder message first
    session.messages.push({
      role: "assistant",
      content: "...", // Placeholder
    });
    session.updatedAt = Date.now();

    // Start typewriter effect
    await typeWriterEffect(reply || "(Empty response)", session);

    // Persist final answer
    session.updatedAt = Date.now();
    await updateSession(session.id, session);
  } catch (e: any) {
    session.messages.push({
      role: "assistant",
      content: `Error: ${e?.message || e}`,
    });
    await updateSession(session.id, session); // Persist error message
  } finally {
    loading.value = false;
    await scrollToBottom();
    sessions.value.sort((a, b) => b.updatedAt - a.updatedAt);
  }
};

const toggleHistory = () => {
  isHistoryCollapsed.value = !isHistoryCollapsed.value;
};
</script>

<style scoped>
/* Base Container */
.ai-page-container {
  display: flex;
  height: 100%;
  width: 100%;
  background-color: var(--ai-bg);
  color: var(--text-primary);
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    sans-serif;
  overflow: hidden;
  --scrollbar-thumb: rgba(0, 0, 0, 0.15);
  --scrollbar-thumb-hover: rgba(0, 0, 0, 0.25);
}

:global(html[data-dark-mode="true"]) .ai-page-container {
  --scrollbar-thumb: rgba(255, 255, 255, 0.15);
  --scrollbar-thumb-hover: rgba(255, 255, 255, 0.25);
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background-color: var(--scrollbar-thumb);
  border: 3px solid transparent;
  background-clip: content-box;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background-color: var(--scrollbar-thumb-hover);
}

/* 2. Center Chat Area */
.ai-chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  background: transparent; /* Inherit from container */
}

/* Welcome Screen */
.welcome-screen {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  overflow-y: auto;
}

.welcome-header {
  text-align: center;
  margin-bottom: 60px;
}

.welcome-logo {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #7a66ff, #cd79ff);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #fff;
  margin: 0 auto 24px;
  box-shadow: 0 10px 30px rgba(122, 102, 255, 0.3);
}

.welcome-title {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 12px;
  color: var(--text-primary);
}

.welcome-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
}

/* Chat Messages */
.chat-list {
  flex: 1;
  overflow-y: auto;
  padding: 40px 40px 120px 40px;
  /* Ensure chat-list allows sticky elements */
  display: flex;
  flex-direction: column;
}

.chat-group {
  position: relative; /* Container for sticky context */
  margin-bottom: 32px;
}

.message-wrapper {
  display: flex;
  gap: 16px;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
}

.message-wrapper.user {
  flex-direction: row-reverse;
  position: sticky; /* Sticky relative to .chat-group */
  top: -20px; /* Pull it slightly up to align better visually */
  z-index: 10;
  padding-top: 10px;
  padding-bottom: 20px; /* Add space below sticky header */
  pointer-events: none;
}

/* Add background specifically to user message content wrapper to cover text underneath when stuck */
.message-wrapper.user .message-content {
  background: var(--ai-bg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
}

.message-wrapper.assistant {
  margin-top: 20px; /* Push down to avoid immediate overlap with sticky header */
  padding-top: 20px; /* Internal padding for spacing */
}

/* Re-enable pointer events for the bubble itself */
.message-wrapper.user .bubble {
  pointer-events: auto;
}

.avatar img {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
}

.ai-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #7a66ff, #cd79ff);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #fff;
  /* Card-like container for AI response */
  border: 1px solid rgba(0, 0, 0, 0.05);
  background: var(--ai-bubble-assistant-bg);
  padding: 20px; /* Increased padding */
  border-radius: 12px;
}

:global(html[data-dark-mode="true"])
  .message-wrapper.assistant
  .message-content {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
}

.bubble {
  /* Reset bubble styles for assistant since container handles bg */
  padding: 0;
  border-radius: 0;
  font-size: 15px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--ai-bubble-assistant-text);
  background: transparent !important; /* Force transparent */
  border: none !important;
}

.user .bubble {
  /* Restore bubble styles for user */
  padding: 12px 16px;
  border-radius: 12px;
  background: var(--ai-bubble-user-bg) !important;
  border-top-right-radius: 2px;
  color: var(--ai-bubble-user-text);
}

:global(html[data-dark-mode="true"]) .user .bubble {
  background: rgba(255, 255, 255, 0.1) !important;
  color: #fff;
  border: none;
}

.assistant .bubble {
  padding-left: 0;
  padding-top: 0;
}

.loading-bubble {
  color: var(--text-secondary);
  font-style: italic;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Input Area */
.input-area {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 32px;
  background: linear-gradient(to top, var(--ai-bg) 80%, transparent);
}

.input-wrapper {
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  background: var(--ai-input-bg);
  border: 1px solid var(--border-color-base);
  border-radius: 12px;
  padding: 8px;
  display: flex;
  align-items: center;
  transition: border-color 0.2s;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
}

.input-wrapper:focus-within {
  border-color: #7a66ff;
  box-shadow: 0 0 0 2px rgba(122, 102, 255, 0.2);
}

.chat-input {
  border: none !important;
  box-shadow: none !important;
  background: transparent !important;
  resize: none;
  padding: 12px 16px;
  font-size: 15px;
  color: var(--ai-input-text);
  flex: 1;
}

.input-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-right: 8px;
}

.action-btn {
  color: var(--text-secondary);
}

.action-btn:hover {
  color: var(--text-primary);
  background: rgba(0, 0, 0, 0.05);
}

.send-btn {
  color: #7a66ff;
}

.send-btn:hover {
  background: rgba(122, 102, 255, 0.1);
  color: #9d8cff;
}

/* 3. Right Sidebar */
.ai-sidebar-right {
  width: 250px;
  background: var(--ai-sidebar-bg);
  border-left: 1px solid var(--border-color-base);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  position: relative;
  transition: width 0.3s ease;
}

.ai-sidebar-right.collapsed {
  width: 0;
  border-left: none;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px;
  overflow: hidden;
  width: 250px;
}

/* Collapse Button */
.collapse-btn {
  position: absolute;
  left: -18px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 64px;
  background: var(--ai-sidebar-bg);
  border: 1px solid var(--border-color-base);
  border-right: none;
  border-radius: 8px 0 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  color: var(--text-secondary);
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.05);
}

.collapse-btn:hover {
  color: var(--brand-primary);
  background: var(--ai-item-hover-bg);
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  font-weight: 600;
  font-size: 16px;
  color: var(--text-primary);
}

.history-count {
  background: var(--ai-item-hover-bg);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}

.more-options {
  color: var(--text-secondary);
  cursor: pointer;
}

.history-list {
  flex: 1;
  overflow-y: auto;
}

.history-group-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 12px;
  margin-top: 12px;
}

.history-group-label:first-child {
  margin-top: 0;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-primary);
  transition: all 0.2s;
  margin-bottom: 4px;
}

.history-item:hover {
  background: var(--ai-item-hover-bg);
}

.history-item.active {
  background: var(--ai-item-active-bg);
  border-left: 2px solid #7a66ff;
  color: var(--ai-item-active-text);
}

.item-icon {
  font-size: 16px;
  color: var(--text-secondary);
}

.history-item.active .item-icon {
  color: #7a66ff;
}

.history-title {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
}

.history-meta {
  font-size: 12px;
  color: var(--text-secondary);
  background: var(--ai-item-hover-bg);
  padding: 2px 6px;
  border-radius: 4px;
}

.empty-history {
  text-align: center;
  color: var(--text-secondary);
  margin-top: 40px;
  font-size: 14px;
}

.new-chat-wrapper {
  margin-top: auto;
  padding-top: 24px;
}

.new-chat-btn-full {
  width: 100%;
  height: 42px;
  background: linear-gradient(135deg, #7a66ff, #6f59ff);
  border: none;
  border-radius: 12px;
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(122, 102, 255, 0.3);
}

.new-chat-btn-full:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(122, 102, 255, 0.4);
}

.new-chat-btn-full:active {
  transform: translateY(0);
}
</style>
