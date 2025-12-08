<template>
  <el-card>
    <template #header> 备忘录 </template>
    <el-form label-position="top">
      <el-form-item label="标题">
        <el-input v-model="title" placeholder="标题" />
      </el-form-item>
      <el-form-item label="内容">
        <el-input
          type="textarea"
          v-model="text"
          :rows="10"
          placeholder="内容（支持HTML预览）"
        />
      </el-form-item>
      <el-space>
        <el-button type="primary" @click="saveNote">保存</el-button>
        <el-button @click="clearForm">清空</el-button>
      </el-space>
      <el-card shadow="never" style="margin-top: 12px">
        <template #header>预览</template>
        <div v-html="text"></div>
      </el-card>
    </el-form>
  </el-card>

  <el-divider content-position="left">备忘录列表</el-divider>
  <el-space direction="vertical" style="width: 100%">
    <el-card v-for="n in notes" :key="n.id" shadow="hover">
      <template #header>
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
        >
          <span>{{ n.title }}</span>
          <span style="color: #888">{{
            formatTime(n.updatedAt || n.createdAt)
          }}</span>
        </div>
      </template>
      <div v-html="n.contentHtml"></div>
      <el-space style="margin-top: 8px">
        <el-button size="small" @click="editNote(n)">编辑</el-button>
        <el-button size="small" type="danger" @click="removeNote(n.id)"
          >删除</el-button
        >
      </el-space>
    </el-card>
  </el-space>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  listNotes,
  createNote,
  updateNote,
  deleteNote,
} from "@/services/backend";

const title = ref("");
const text = ref("");
const editingId = ref<string | null>(null);
const notes = ref<Array<any>>([]);

const loadNotes = async () => {
  const res = await listNotes();
  notes.value = res?.data || [];
};

const saveNote = async () => {
  if (editingId.value) {
    const res = await updateNote(editingId.value, {
      title: title.value,
      contentHtml: text.value,
    });
    if (res?.success) {
      await loadNotes();
      clearForm();
    }
    return;
  }
  const res = await createNote({ title: title.value, contentHtml: text.value });
  if (res?.success) {
    await loadNotes();
    clearForm();
  }
};

const clearForm = () => {
  title.value = "";
  text.value = "";
  editingId.value = null;
};

const editNote = (n: any) => {
  editingId.value = n.id;
  title.value = n.title || "";
  text.value = n.contentHtml || "";
};

const removeNote = async (id: string) => {
  const res = await deleteNote(id);
  if (res?.success) {
    await loadNotes();
    if (editingId.value === id) clearForm();
  }
};

const formatTime = (t?: string) => {
  try {
    return new Date(t || "").toLocaleString();
  } catch {
    return "";
  }
};

onMounted(() => {
  loadNotes();
});
</script>

<style scoped></style>
