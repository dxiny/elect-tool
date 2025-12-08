const getApiBaseUrl = () => {
  try {
    const v = localStorage.getItem("apiBaseUrl");
    return v && v.trim() ? v.trim() : "";
  } catch {
    return "";
  }
};

const httpGet = async (path: string) => {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}${path}`);
  return res.json();
};

const httpPost = async (path: string, body: any) => {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
};

const httpPut = async (path: string, body: any) => {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
};

const httpDelete = async (path: string) => {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}${path}`, { method: "DELETE" });
  return res.json();
};

export const listProjects = async () => {
  return httpGet("/api/projects");
};

export const createProject = async (payload: {
  name: string;
  ownerId?: string | null;
  description?: string;
}) => {
  return httpPost("/api/projects", payload);
};

export const listAssets = async (projectId?: string) => {
  const q = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";
  return httpGet(`/api/assets${q}`);
};

export const addAsset = async (payload: {
  projectId?: string | null;
  type?: string;
  filename?: string;
  path?: string;
  size?: number;
  hash?: string;
  metadata?: any;
}) => {
  return httpPost("/api/assets", payload);
};

export const listNotes = async (projectId?: string, q?: string) => {
  const params = new URLSearchParams();
  if (projectId) params.set("projectId", projectId);
  if (q) params.set("q", q);
  const qs = params.toString();
  const path = qs ? `/api/notes?${qs}` : "/api/notes";
  return httpGet(path);
};

export const createNote = async (payload: {
  projectId?: string | null;
  title?: string;
  contentHtml?: string;
  tags?: string[];
}) => {
  return httpPost("/api/notes", payload);
};

export const updateNote = async (id: string, patch: any) => {
  return httpPut(`/api/notes/${encodeURIComponent(id)}`, patch);
};

export const deleteNote = async (id: string) => {
  return httpDelete(`/api/notes/${encodeURIComponent(id)}`);
};
