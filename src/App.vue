<script setup>
import "./CLodopFuncs.js";
import { ref, shallowRef, watch, onMounted, onBeforeUnmount } from "vue";
import Menu from "./components/menu.vue";

// 动态导入demo目录下的所有vue组件
const modules = import.meta.glob("./demo/*.vue");

// 用于动态加载选中的组件
const currentComponent = shallowRef(null);
const DEFAULT_ROUTE = "/";
const ROUTE_STORAGE_KEY = "vue-print-current-route";

const syncSessionRoute = (route) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    sessionStorage.setItem(ROUTE_STORAGE_KEY, route);
  } catch (error) {
    console.warn("存储路由信息失败:", error);
  }
};

const getHashRoute = () => {
  if (typeof window === "undefined") {
    return DEFAULT_ROUTE;
  }
  const rawHash = window.location.hash.slice(1);
  if (!rawHash) {
    return DEFAULT_ROUTE;
  }
  try {
    return decodeURI(rawHash) || DEFAULT_ROUTE;
  } catch (error) {
    console.warn("解析哈希路由失败:", error);
    return DEFAULT_ROUTE;
  }
};

const resolveInitialRoute = () => {
  if (typeof window === "undefined") {
    return DEFAULT_ROUTE;
  }

  const hashRoute = getHashRoute();
  if (hashRoute && hashRoute !== DEFAULT_ROUTE) {
    return hashRoute;
  }

  try {
    const storedRoute = sessionStorage.getItem(ROUTE_STORAGE_KEY);
    return storedRoute || DEFAULT_ROUTE;
  } catch (error) {
    console.warn("读取路由缓存失败:", error);
    return DEFAULT_ROUTE;
  }
};

const currentRoute = ref(resolveInitialRoute());

const loadComponent = async (componentName) => {
  if (!componentName) {
    currentComponent.value = null;
    return;
  }

  // 构造组件路径
  const componentPath = `./demo/${componentName}.vue`;

  // 检查组件是否存在
  if (modules[componentPath]) {
    try {
      // 动态导入组件
      const module = await modules[componentPath]();
      currentComponent.value = module.default;
    } catch (error) {
      console.error("加载组件失败:", error);
      currentComponent.value = null;
    }
  } else {
    console.warn(`组件 ${componentName} 不存在`);
    currentComponent.value = null;
  }

  if (!currentComponent.value) {
    currentComponent.value = `./demo/${componentName}`;
  }
};

const handleHashChange = () => {
  const hashRoute = getHashRoute();
  if (hashRoute !== currentRoute.value) {
    currentRoute.value = hashRoute;
  }
};

const syncHashRoute = (route) => {
  if (typeof window === "undefined") {
    return;
  }
  const encodedRoute = encodeURI(route);
  const currentHash = window.location.hash.slice(1);
  if (currentHash !== encodedRoute) {
    window.location.hash = encodedRoute;
  }
};

// 监听路由变化
watch(
  currentRoute,
  async (newRoute) => {
    const route = newRoute || DEFAULT_ROUTE;

    // 解析路由，如果是demo路由则加载对应组件
    if (route.startsWith("/demo/")) {
      const componentName = route.substring(6); // 移除 '/demo/' 前缀
      await loadComponent(componentName);
    } else {
      currentComponent.value = null;
    }

    if (typeof window !== "undefined") {
      syncHashRoute(route);
    }

    syncSessionRoute(route);
  },
  { immediate: true }
);

onMounted(() => {
  if (typeof window !== "undefined") {
    syncHashRoute(currentRoute.value || DEFAULT_ROUTE);
    window.addEventListener("hashchange", handleHashChange);
  }
});

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("hashchange", handleHashChange);
  }
});

// 模拟路由变化的方法（在实际项目中可能由路由器处理）
const handleMenuSelect = (route) => {
  currentRoute.value = route;
};
</script>

<template>
  <div>
    <Menu @select="handleMenuSelect" />
    <div class="content">
      <!-- 动态组件 -->
      <component
        :is="currentComponent"
        v-if="currentComponent"
        class="demo-component"
      />

      <!-- 默认内容 -->
      <div v-else class="welcome">
        <h1>欢迎使用 Vue Print 应用</h1>
        <p>请选择左侧菜单中的选项来查看不同的演示组件。</p>
      </div>
    </div>
  </div>
</template>

<style>
html,
body,
#app {
  height: 100%;
  background: #eee;
}

.content {
  padding-left: 200px;
  height: 100vh;
}

.welcome {
  text-align: center;
  padding: 50px 20px;
}

.welcome h1 {
  color: #333;
  margin-bottom: 20px;
}

.welcome p {
  color: #666;
  font-size: 18px;
}

.demo-component {
  padding: 20px;
  border-radius: 4px;
}
</style>
