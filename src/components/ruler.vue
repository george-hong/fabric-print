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
        >
            <div class="ruler-content">
                <slot></slot>
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
let horizontalRuler
let verticalRuler
const dragInfo = ref({
    dragging: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    x: 0,
    y: 0,
    
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
    const unit = 'mm'
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
    console.log('up ', event)
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

const setContentToCenter = () => {
    
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
}
</style>