import { createApp } from "vue";
import { createPinia } from "pinia";
import { createI18n } from "vue-i18n";
import App from "./App.vue";
import router from "./router";
import zhCN from "./locales/zh-CN";
import enUS from "./locales/en-US";
import * as AntdIconsVue from "@ant-design/icons-vue";
import Antd from "ant-design-vue";
import "ant-design-vue/dist/reset.css";
import { initThemeVars } from "./utils/theme";
import "./styles/theme/variables.css";
import "./styles/theme/light.css";
import "./styles/theme/dark.css";

const i18n = createI18n({
  legacy: false,
  locale: "zh-CN",
  fallbackLocale: "en-US",
  messages: {
    "zh-CN": zhCN,
    "en-US": enUS,
  },
});

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(i18n);
app.use(Antd);
for (const [key, component] of Object.entries(AntdIconsVue)) {
  app.component(key, component);
}
initThemeVars();
app.mount("#app");
