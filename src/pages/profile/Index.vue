<template>
  <a-card>
    <template #title>
      <a-space align="center" style="padding: 4px 0">
        <a-avatar :src="avatarSrc" :size="56">{{ nameFirstLetter }}</a-avatar>
        <div style="display: flex; align-items: center; gap: 8px">
          <span style="font-weight: 600; font-size: 16px">{{
            name || "未设置名称"
          }}</span>
        </div>
      </a-space>
    </template>
    <template #extra>
      <a-tooltip title="编辑资料">
        <a-button type="text" @click="openEdit">
          <EditOutlined />
        </a-button>
      </a-tooltip>
    </template>

    <a-descriptions :column="1" bordered>
      <a-descriptions-item label="邮箱">{{
        email || "未设置邮箱"
      }}</a-descriptions-item>
      <a-descriptions-item label="系统版本">{{
        systemVersion
      }}</a-descriptions-item>
      <a-descriptions-item label="主题模式">
        <ThemeSwitch class="theme-mini" />
      </a-descriptions-item>
    </a-descriptions>
  </a-card>

  <a-modal
    v-model:open="editOpen"
    title="编辑个人资料"
    :confirm-loading="saving"
    okText="保存"
    cancelText="取消"
    @ok="saveEdit"
    @cancel="closeEdit"
  >
    <a-form layout="vertical">
      <a-form-item label="">
        <div
          style="
            display: flex;
            align-items: center;
            gap: 12px;
            margin-top: 20px;
          "
        >
          <a-avatar :src="editAvatarPreview || avatarSrc" :size="64">{{
            nameFirstLetter
          }}</a-avatar>
          <a-upload
            :show-upload-list="false"
            :before-upload="handleBeforeUpload"
          >
            <a-button>上传</a-button>
          </a-upload>
        </div>
        <div style="margin-top: 8px">
          <a-input
            v-model:value="editAvatarUrl"
            placeholder="或粘贴头像图片地址"
          />
        </div>
      </a-form-item>
      <a-form-item label="用户名称">
        <a-input v-model:value="editName" placeholder="请输入用户名称" />
      </a-form-item>
      <a-form-item label="邮箱">
        <a-input v-model:value="editEmail" placeholder="请输入邮箱" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { message } from "ant-design-vue";
import { profileApi } from "@/api/profile";
import ThemeSwitch from "@/components/ThemeSwitch.vue";

const name = ref("");
const email = ref("");
const systemVersion = ref("");
const userId = ref("-");
const avatarSrc = ref<string>("");
const nameFirstLetter = ref("U");

const themeMode = ref<"light" | "dark">("light");
const themeModeLabel = ref("light");

// 从服务端加载个人资料
const loadProfile = async () => {
  try {
    const j = await profileApi.getProfile();
    if (j?.success && j?.data) {
      themeMode.value = j.data.themeMode === "dark" ? "dark" : "light";
      themeModeLabel.value = themeMode.value;
      name.value = j.data.name || "";
      email.value = j.data.email || "";
      systemVersion.value = "1.0.0";
      userId.value = j.data.id || "-";
      avatarSrc.value = j.data.avatarDataUrl || "";
      nameFirstLetter.value = (name.value || "U").charAt(0).toUpperCase();
    }
  } catch {}
};

loadProfile();

// 编辑弹窗相关状态与逻辑
const editOpen = ref(false);
const saving = ref(false);
const editName = ref("");
const editEmail = ref("");
const editAvatarPreview = ref<string>("");
const editAvatarUrl = ref<string>("");

const openEdit = () => {
  editName.value = name.value;
  editEmail.value = email.value;
  editAvatarPreview.value = "";
  editAvatarUrl.value = "";
  editOpen.value = true;
};

const closeEdit = () => {
  editOpen.value = false;
};

// 拦截上传，直接读取为 data URL 进行预览与保存
const handleBeforeUpload = async (file: File) => {
  const toDataUrl = (f: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(f);
    });
  try {
    editAvatarPreview.value = await toDataUrl(file);
  } catch {}
  return false;
};

// 保存编辑的名称、邮箱与头像
const saveEdit = async () => {
  saving.value = true;
  try {
    // 基本信息
    await profileApi.updateBasic({
      name: editName.value,
      email: editEmail.value,
    });
    // 头像：优先 dataUrl，其次外部地址
    if (editAvatarPreview.value || editAvatarUrl.value) {
      await profileApi.updateAvatar({
        dataUrl: editAvatarPreview.value || undefined,
        url: editAvatarUrl.value || undefined,
      });
    }
    await loadProfile();
    message.success("更新成功!");
    editOpen.value = false;
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.theme-mini :deep(.toggle) {
  width: 50px;
  height: 24px;
}
</style>
