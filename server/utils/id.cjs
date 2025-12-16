// 主键生成：基于时间戳与随机数的可读ID，如 proj_xxx
function genId(prefix) {
  const r = Math.random().toString(36).slice(2);
  const d = Date.now().toString(36);
  return `${prefix}_${d}_${r}`;
}

module.exports = { genId };
