<template>
    <div class="ruler-box">
        <div :style="computedStyles.square" class="ruler-square">
        </div>
        <div :style="computedStyles.horizontal" class="ruler-el-horizontal" ref="horizontalRuleEl">
        </div>
        <div :style="computedStyles.vertical" class="ruler-el-vertical" ref="verticalRuleEl">
        </div>
        <div 
        :style="computedStyles.content"
        class="ruler-container"
        @mousedown="containerMousedownEvent"
        @mouseup="containerMouseupEvent"
        @mousemove="containerMousemoveEvent"
        @scroll="() => containerScrollEvent()"
        ref="containerElRef"
        >
          <div class="ruler-content-position-box" ref="positionElRef">
            <div class="ruler-content" ref="contentElRef">
              <slot></slot>
            </div>
          </div>
        </div>
    </div>
</template>

<script setup>
import {
    ref, onMounted, computed,
    onBeforeUnmount,

} from 'vue';
import Ruler from '@scena/ruler';
import PixelConverter from '@/utils/pixelConverter';

const horizontalRuleEl = ref();
const verticalRuleEl = ref();
const containerElRef = ref();
const positionElRef = ref();
const contentElRef = ref();
const unit = 'mm'
let horizontalRuler
let verticalRuler
const dragInfo = ref({
    dragging: false,
    startX: 0, // 鼠标点击时记录的pageX值，单位px
    startY: 0, // 鼠标点击时记录的pageY值，单位px
    lastX: 0, // 鼠标最后拖拽时记录的pageX值，单位mm
    lastY: 0, // 鼠标最后拖拽时记录的pageX值，单位mm
    offsetX: 0, // 打印内容到容器的初始间距X，单位mm
    offsetY: 0, // 打印内容到容器的初始间距Y，单位mm
    x: 0, // 单位mm
    y: 0, // 单位mm
    
})
const props = defineProps({
    horiSize: {
        type: Number,
        default: 10
    },
    vertSize: {
        type: Number,
        default: 10
    },
    zoom: {
        type: Number,
        default: 1, // 标尺缩放比例
    }
})

const computedStyles = computed(() => {
    const horiSize = props.horiSize
    const vertSize = props.vertSize
    return {
        square: {
            width: `${horiSize}${unit}`,
            height: `${vertSize}${unit}`
        },
        horizontal: {
            left: `${horiSize}${unit}`,
            height: `${vertSize}${unit}`,
            width: `calc(100% - ${horiSize}${unit})`,
        },
        vertical: {
            top: `${vertSize}${unit}`,
            width: `${horiSize}${unit}`,
            height: `calc(100% - ${vertSize}${unit})`,
        },
        content: {
            top: `${horiSize}${unit}`,
            left: `${vertSize}${unit}`,
            width: `calc(100% - ${horiSize}${unit})`,
            height: `calc(100% - ${vertSize}${unit})`,
        }
    }
})

const containerMousedownEvent = (event) => {
    dragInfo.value.dragging = true
    dragInfo.value.startX = event.clientX
    dragInfo.value.startY = event.clientY
}

const containerMouseUpEvent = (event) => {
    dragInfo.value.dragging = false
    dragInfo.value.x = dragInfo.value.lastX
    dragInfo.value.y = dragInfo.value.lastY
}

const containerMousemoveEvent = (event) => {
    if (dragInfo.value.dragging) {
        const diffX = event.pageX - dragInfo.value.startX
        const diffY = event.pageY - dragInfo.value.startY
        const x = dragInfo.value.x - PixelConverter.pxToMm(diffX)
        const y = dragInfo.value.y - PixelConverter.pxToMm(diffY)
        dragInfo.value.lastX = x // 单位mm
        dragInfo.value.lastY = y // 单位mm
        if (horizontalRuler) horizontalRuler.scroll(x / 10) // 单位cm
        if (verticalRuler) verticalRuler.scroll(y / 10) // 单位cm
    }
}

const containerScrollEvent = (scrollInfo) => {
    console.log('containerScrollEvent', scrollInfo)
    // 1. 获取内容宽高并转换成显示单位
    const { width, height } = contentElRef.value.getBoundingClientRect()
    const contentWidthMM = PixelConverter.pxToMm(width)
    const contentHeightMM = PixelConverter.pxToMm(height)
    // 2. 获取容器滚动距离并转换成显示单位
    const { scrollLeft, scrollTop } = containerElRef.value
    const { width: cWidth, height: cHeight } = containerElRef.value.getBoundingClientRect()
    // 由于滚动方向和标尺方向相反，所以需要转换
    const scrollLeftMM = PixelConverter.pxToMm(cWidth - scrollLeft)
    const scrollTopMM = PixelConverter.pxToMm(cHeight - scrollTop)
    // 3. 计算标尺起点偏移量
    const offsetX = scrollLeftMM - contentWidthMM / 2
    const offsetY = scrollTopMM - contentHeightMM / 2
    
    horizontalRuler.scroll((scrollInfo ? offsetX : -offsetX) / 10)
    verticalRuler.scroll((scrollInfo ? offsetY : -offsetY) / 10)
}

const setContentToCenter = () => {

    const { width, height } = containerElRef.value.getBoundingClientRect()
    containerElRef.value.scrollLeft = width / 2
    containerElRef.value.scrollTop = height / 2
    // 触发 scroll 事件
    containerScrollEvent({
        scrollLeft: width / 2,
        scrollTop: height / 2,
    })
}

onMounted(() => {
    // 创建水平标尺
    horizontalRuler = new Ruler(horizontalRuleEl.value, {
        type: "horizontal",
        unit: 1 * props.zoom,
        zoom: 37.7952
    });
    // 创建垂直标尺
    verticalRuler = new Ruler(verticalRuleEl.value, {
        type: "vertical",
        unit: 1 * props.zoom,
        zoom: 37.7952
    });

    window.addEventListener("resize", () => {
        horizontalRuler.resize();
        verticalRuler.resize();
    });

    window.addEventListener("mouseup", containerMouseUpEvent)

  setContentToCenter()
});

onBeforeUnmount(() => {
    window.removeEventListener("mouseup", containerMouseUpEvent)
})
</script>

<style scoped>
.ruler-box {
    position: relative;
    width: 100%;
    height: 100%;
}

.ruler-square {
    position: absolute;
    top: 0;
    left: 0;
}

.ruler-el-horizontal {
    position: absolute;
    top: 0;
}

.ruler-el-vertical {
    position: absolute;
    left: 0;
}

.ruler-container {
    position: absolute;
    overflow: auto;
}

.ruler-content-position-box {
  position: relative;
  width: 200%;
  height: 200%;
}

.ruler-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>