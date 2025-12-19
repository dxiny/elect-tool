import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import * as AntdIconsVue from "@ant-design/icons-vue";
import Antd from "ant-design-vue";
import "ant-design-vue/dist/reset.css";
import { initThemeVars } from "./utils/theme";
import "./styles/theme/variables.css";
import "./styles/theme/light.css";
import "./styles/theme/dark.css";

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(Antd);
for (const [key, component] of Object.entries(AntdIconsVue)) {
  app.component(key, component);
}
initThemeVars();
app.mount("#app");
