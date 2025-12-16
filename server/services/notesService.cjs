const { genId } = require("../utils/id.cjs");
const repo = require("../repositories/notesRepo.cjs");

function list(projectId, q) {
  return repo.list(projectId || null, q || "");
}

function create(payload) {
  const id = genId("note");
  const now = new Date().toISOString();
  const entity = {
    id,
    projectId: payload?.projectId || null,
    title: String(payload?.title || ""),
    contentHtml: String(payload?.contentHtml || ""),
    tags: Array.isArray(payload?.tags) ? payload.tags : [],
    createdAt: now,
    updatedAt: now,
  };
  return repo.create(entity);
}

function get(id) {
  return repo.get(id);
}

function update(id, patch) {
  return repo.update(id, patch || {});
}

function remove(id) {
  return repo.remove(id);
}

module.exports = { list, create, get, update, remove };
