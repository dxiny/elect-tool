
const request = async (path: string, init?: RequestInit) => {
  const base = import.meta.env.VITE_IP || "";
  const res = await fetch(`${base}${path}`, init);
  const ct = res.headers.get("content-type") || "";
  const isJson = ct.includes("application/json");
  const payload = isJson
    ? await res.json().catch(() => null)
    : await res.text();
  console.log("base", base);
  console.log("res", res);
  console.log("payload", payload);

  if (!res.ok) {
    const msg =
      typeof payload === "string" ? payload : JSON.stringify(payload || {});
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${msg}`);
  }
  return payload;
};

const httpGet = async (path: string) => {
  return request(path);
};

const httpPost = async (path: string, body: any) => {
  return request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
};

const httpPut = async (path: string, body: any) => {
  return request(path, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
};

const httpDelete = async (path: string) => {
  return request(path, { method: "DELETE" });
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
