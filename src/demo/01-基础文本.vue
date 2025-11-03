<script setup lang="ts">
import { ref, onMounted, shallowRef, watch } from "vue";
import { StaticCanvas, FabricText, Point } from "fabric";
import canvas2pdf from 'canvas2pdf'

const canvasBox = ref();
const canvas = new StaticCanvas(null, {
  backgroundColor: "#fff", // 设置白色背景
});
const text = new FabricText("Fabric!");
const text2 = new FabricText("CCCCC!");

const downloadCanvas = () => {
  const imageSrc = canvas.toDataURL();
  // some download code down here
  const a = document.createElement("a");
  a.href = imageSrc;
  // a.download = "image.png";
  // document.body.appendChild(a);
  // a.click();
  // document.body.removeChild(a);


};

const downloadLodop = () => {
  const imageSrc = canvas.toDataURL();
  const img = `<img src="${imageSrc}">`;

  window.CLODOP.ADD_PRINT_HTM(0, 0, 300, 150, img);

  window.CLODOP.PRINT();
};

canvas.add(text);
canvas.add(text2);
canvas.centerObject(text);
text2.setXY(new Point(10, 10));

onMounted(() => {
  canvasBox.value.appendChild(canvas.getElement());
});
</script>

<template>
  <div>
    <div ref="canvasBox"></div>
    <button @click="downloadCanvas">fabric下载</button>
    <button @click="downloadLodop">lodop下载</button>
  </div>
</template>

<style scoped></style>
