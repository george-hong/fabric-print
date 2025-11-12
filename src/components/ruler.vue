<template>
  <div class="ruler-box">
    <div :style="computedStyles.square" class="ruler-square"></div>
    <div
      :style="computedStyles.horizontal"
      class="ruler-el-horizontal"
      ref="horizontalRuleEl"
    ></div>
    <div
      :style="computedStyles.vertical"
      class="ruler-el-vertical"
      ref="verticalRuleEl"
    ></div>
    <div
      :style="computedStyles.content"
      class="ruler-container"
      @mousedown="containerMousedownEvent"
      @mouseup="containerMouseupEvent"
      @mousemove="containerMousemoveEvent"
      @scroll="containerScrollEvent"
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
import { ref, onMounted, computed, onBeforeUnmount } from "vue";
import Ruler from "@scena/ruler";
import PixelConverter from "@/utils/pixelConverter";

const horizontalRuleEl = ref();
const verticalRuleEl = ref();
const containerElRef = ref();
const positionElRef = ref();
const contentElRef = ref();
const unit = "mm";
let horizontalRuler;
let verticalRuler;
const dragInfo = ref({
  dragging: false,
  startX: 0, // 鼠标点击时记录的pageX值，单位px
  startY: 0, // 鼠标点击时记录的pageY值，单位px
  startScrollLeft: 0, // 鼠标点击时记录的pageX值，单位px
  startScrollTop: 0, // 鼠标点击时记录的pageY值，单位px
});
const props = defineProps({
  horiSize: {
    type: Number,
    default: 10,
  },
  vertSize: {
    type: Number,
    default: 10,
  },
  zoom: {
    type: Number,
    default: 1, // 标尺缩放比例
  },
});

const computedStyles = computed(() => {
  const horiSize = props.horiSize;
  const vertSize = props.vertSize;
  return {
    square: {
      width: `${horiSize}${unit}`,
      height: `${vertSize}${unit}`,
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
    },
  };
});

const containerMousedownEvent = (event) => {
  const { scrollLeft, scrollTop } = containerElRef.value;
  dragInfo.value.dragging = true;
  dragInfo.value.startX = event.pageX;
  dragInfo.value.startY = event.pageY;
  dragInfo.value.startScrollLeft = scrollLeft;
  dragInfo.value.startScrollTop = scrollTop;
};

const containerMouseUpEvent = (event) => {
  dragInfo.value.dragging = false;
};

const containerMousemoveEvent = (event) => {
  if (dragInfo.value.dragging) {
    const diffX = event.pageX - dragInfo.value.startX;
    const diffY = event.pageY - dragInfo.value.startY;
    // 始终使用鼠标点击时的页面蜷缩量和坐标来计算当前鼠标位置的偏移量
    // 新的蜷缩量 = 初始蜷缩量 - （当前鼠标位置 - 初始鼠标位置）
    //                     ^
    //  这里用减法是因为蜷缩方向与鼠标移动方向是相反的
    const { startScrollLeft, startScrollTop } = dragInfo.value;
    const { width, height } = containerElRef.value.getBoundingClientRect();

    let newScrollLeft = startScrollLeft;
    let newScrollTop = startScrollTop;
    if (diffX > 0) {
      newScrollLeft = Math.max(0, startScrollLeft - diffX);
    } else if (diffX < 0) {
      newScrollLeft = Math.min(width, startScrollLeft - diffX);
    }
    if (diffY > 0) {
      newScrollTop = Math.max(0, startScrollTop - diffY);
    } else if (diffY < 0) {
      newScrollTop = Math.min(height, startScrollTop - diffY);
    }

    containerElRef.value.scrollLeft = newScrollLeft;
    containerElRef.value.scrollTop = newScrollTop;

    triggerScrollChange({
      scrollTop: newScrollTop,
      scrollLeft: newScrollLeft,
    });
  }
};

const triggerScrollChange = (scrollInfo) => {
  // 1. 获取内容宽高并转换成显示单位
  const { width, height } = contentElRef.value.getBoundingClientRect();
  const contentWidthMM = PixelConverter.pxToMm(width);
  const contentHeightMM = PixelConverter.pxToMm(height);
  // 2. 获取容器滚动距离并转换成显示单位
  const { scrollLeft, scrollTop } = containerElRef.value;
  const { width: cWidth, height: cHeight } =
    containerElRef.value.getBoundingClientRect();
  // 由于滚动方向和标尺方向相反，所以需要转换
  const scrollLeftMM = PixelConverter.pxToMm(cWidth - scrollLeft);
  const scrollTopMM = PixelConverter.pxToMm(cHeight - scrollTop);
  // 3. 计算标尺起点偏移量
  const offsetX = scrollLeftMM - contentWidthMM / 2;
  const offsetY = scrollTopMM - contentHeightMM / 2;

  horizontalRuler.scroll((scrollInfo ? offsetX : -offsetX) / 10);
  verticalRuler.scroll((scrollInfo ? offsetY : -offsetY) / 10);
};

const containerScrollEvent = () => {
  if (!dragInfo.value.dragging) {
    triggerScrollChange();
  }
};

const setContentToCenter = () => {
  const { width, height } = containerElRef.value.getBoundingClientRect();
  containerElRef.value.scrollLeft = width / 2;
  containerElRef.value.scrollTop = height / 2;
  // 触发 scroll 事件
  triggerScrollChange({
    scrollLeft: width / 2,
    scrollTop: height / 2,
  });
};

onMounted(() => {
  // 创建水平标尺
  horizontalRuler = new Ruler(horizontalRuleEl.value, {
    type: "horizontal",
    unit: 1 * props.zoom,
    zoom: 37.7952,
  });
  // 创建垂直标尺
  verticalRuler = new Ruler(verticalRuleEl.value, {
    type: "vertical",
    unit: 1 * props.zoom,
    zoom: 37.7952,
  });

  window.addEventListener("resize", () => {
    horizontalRuler.resize();
    verticalRuler.resize();
  });

  window.addEventListener("mouseup", containerMouseUpEvent);

  setContentToCenter();
});

onBeforeUnmount(() => {
  window.removeEventListener("mouseup", containerMouseUpEvent);
});
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
