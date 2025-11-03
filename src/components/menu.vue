<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface MenuItem {
  id: number
  name: string
  icon?: string
  route?: string
  componentName?: string
}

const emit = defineEmits<{
  (e: 'select', route: string): void
}>()

const menuItemsRaw = ref<Omit<MenuItem, 'id'>[]>([
  { name: '首页', route: '/' }
])

const demoComponents = ref<{name: string, componentName: string}[]>([])

const menuItems = computed<MenuItem[]>(() => {
  const items: Omit<MenuItem, 'id'>[] = [...menuItemsRaw.value]
  
  // 添加demo组件到菜单项中
  demoComponents.value.forEach((comp, index) => {
    items.push({
      name: comp.name,
      route: `/demo/${comp.componentName}`,
      componentName: comp.componentName
    })
  })
  
  // 为所有菜单项生成ID
  return items.map((item, index) => ({
    ...item,
    id: index + 1
  }))
})

const activeItem = ref<number>(1)
const isCollapsed = ref<boolean>(false)

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const selectMenu = (item: MenuItem) => {
  activeItem.value = item.id
  // 发送选中事件给父组件
  if (item.route) {
    emit('select', item.route)
  }
}

// 动态扫描demo目录下的组件
const scanDemoComponents = async () => {
  // 使用Vite的import.meta.glob动态导入demo目录下的所有vue文件
  const modules = import.meta.glob('../demo/*.vue')
  
  const components = []
  for (const path in modules) {
    // 从路径中提取文件名（不含扩展名）
    const fileName = path.split('/').pop()?.replace('.vue', '') || ''
    
    // 将文件名转换为更友好的显示名称
    // 例如: bsaeText -> 基础文本, controller -> 控制器
    const displayName = convertFileNameToDisplayName(fileName)
    
    components.push({
      name: displayName,
      componentName: fileName
    })
  }
  
  demoComponents.value = components
}

// 将文件名转换为显示名称的辅助函数
const convertFileNameToDisplayName = (fileName: string): string => {
  // 这里可以实现更复杂的转换逻辑
  // 目前只是一个简单的映射示例
  const nameMap: Record<string, string> = {
    'bsaeText': '基础文本',
    'controller': '控制器'
  }
  
  return nameMap[fileName] || fileName
}

onMounted(() => {
  scanDemoComponents()
})
</script>

<template>
  <div class="menu" :class="{ collapsed: isCollapsed }">
    <div class="menu-toggle" @click="toggleCollapse">
      <span>{{ isCollapsed ? '>>' : '<<' }}</span>
    </div>
    <ul class="menu-list">
      <li 
        v-for="item in menuItems" 
        :key="item.id"
        :class="{ active: item.id === activeItem }"
        @click="selectMenu(item)"
        class="menu-item"
      >
        <span class="menu-icon" v-if="item.icon">{{ item.icon }}</span>
        <span class="menu-name">{{ isCollapsed ? item.name.charAt(0) : item.name }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.menu {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 200px;
  background-color: #2c3e50;
  color: white;
  transition: width 0.3s ease;
  z-index: 1000;
  box-shadow: 2px 0 5px rgba(0,0,0,0.1);
}

.menu.collapsed {
  width: 60px;
}

.menu-toggle {
  display: flex;
  justify-content: flex-end;
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #34495e;
}

.menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  padding: 15px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: #34495e;
}

.menu-item.active {
  background-color: #3498db;
}

.menu-icon {
  margin-right: 10px;
  font-size: 18px;
}

.menu-name {
  white-space: nowrap;
  overflow: hidden;
}
</style>