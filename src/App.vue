<script setup>
import "./CLodopFuncs.js";
import { ref, shallowRef, watch } from "vue";
import Menu from "./components/menu.vue";

// 动态导入demo目录下的所有vue组件
const modules = import.meta.glob("./demo/*.vue");

// 用于动态加载选中的组件
const currentComponent = shallowRef(null);
const currentRoute = ref("/");

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

// 监听路由变化
watch(currentRoute, (newRoute) => {
  // 解析路由，如果是demo路由则加载对应组件
  if (newRoute.startsWith("/demo/")) {
    const componentName = newRoute.substring(6); // 移除 '/demo/' 前缀
    loadComponent(componentName);
  } else {
    currentComponent.value = null;
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
  min-height: 100vh;
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
