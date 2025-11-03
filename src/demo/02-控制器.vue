<script setup lang="ts">
import { ref, onMounted, shallowRef, watch } from "vue";
import { Canvas, FabricText, Point } from "fabric";

const canvasRef = ref();
let canvas;
const downloadLodop = () => {
  const imageSrc = canvas.toDataURL();
  const img = `<img src="${imageSrc}">`;

  window.CLODOP.ADD_PRINT_HTM(0, 0, 300, 150, img);

  window.CLODOP.PRINT();
};

onMounted(() => {
  canvas = new Canvas(canvasRef.value, {
    backgroundColor: "#fff", // 设置白色背景
    width: 500,
    height: 500,
  });
  const text = new FabricText("Fabric!");
  canvas.add(text);
  canvas.centerObject(text);
});
</script>

<template>
  <div>
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<style scoped></style>
