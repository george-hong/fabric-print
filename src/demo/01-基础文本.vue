<script setup lang="ts">
import { ref, onMounted, shallowRef, watch } from "vue";
import { StaticCanvas, FabricText, Point } from "fabric";
import jspdf from 'jspdf'
import PixelConverter from "@/utils/pixelConverter";

const multiplier = ref(5)
const canvasBox = ref();
const canvasWidth = PixelConverter.mmToPx(30);
const canvas = new StaticCanvas(null, {
  backgroundColor: "#fff", // 设置白色背景
  width: canvasWidth,
  height: canvasWidth,
});


const downloadCanvas = () => {
  const imageSrc = canvas.toDataURL({
    multiplier: multiplier.value, // 控制生成图片的清晰度   https://fabricjs.com/api/classes/staticcanvas/#todataurl
  });
  // some download code down here
  const a = document.createElement("a");
  a.href = imageSrc;
  a.download = "image.png";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const downloadLodop = () => {
  const imageSrc = canvas.toDataURL();
  const img = `<img src="${imageSrc}">`;

  window.CLODOP.ADD_PRINT_HTM(0, 0, 300, 150, img);

  window.CLODOP.PRINT();
};

const generateText = (canvas) => {
  const data = [
    {
      text: '打印测试:6号文本黑体',
      fontSize: PixelConverter.ptToPx(6),
      fontFamily: '黑体',
      top: 1,
      left: 2,
    },
    {
      text: '打印测试:8号文本黑体',
      fontSize: PixelConverter.ptToPx(8),
      fontFamily: '黑体',
      top: 10,
      left: 2,
    },
    {
      text: '打印测试:10号文本黑体',
      fontSize: PixelConverter.ptToPx(10),
      fontFamily: '黑体',
      top: 22,
      left: 2,
    },
    {
      text: '打印测试:10号加粗黑体',
      fontSize: PixelConverter.ptToPx(10),
      fontFamily: '黑体',
      top: 38,
      left: 2,
      fontWeight: 'bold',
    },
    {
      text: '打印测试:12号文本黑体',
      fontSize: PixelConverter.ptToPx(12),
      fontFamily: '黑体',
      top: 60,
      left: 2,
    },
    {
      text: '打印测试:12号加粗黑体',
      fontSize: PixelConverter.ptToPx(12),
      fontFamily: '黑体',
      fontWeight: 'bold',
      top: 80,
      left: 2,
    },
  ]

  data.forEach(textInfo => {
      const text = new FabricText(textInfo.text, {
        fontSize: textInfo.fontSize,
        fontFamily: textInfo.fontFamily,
        top: textInfo.top,
        left: textInfo.left,
        fontWeight: textInfo.fontWeight,
      });
      canvas.add(text);
  })
}

const downloadPDF = () => {
  const base64Image = canvas.toDataURL({
    multiplier: multiplier.value, // 控制生成图片的清晰度   https://fabricjs.com/api/classes/staticcanvas/#todataurl
    quality: 1,
    format: 'jpeg',
  });

  console.log('base64Image',base64Image)

  // 1. 定义 PDF 尺寸（示例：宽 10cm，高 15cm，也可使用 'mm'、'px' 等单位）
  const pdfWidth = 3; // 宽 10cm
  const pdfHeight = 3; // 高 15cm
  const unit = 'cm'; // 单位：厘米（可选 'mm'/'px'/'in'）

// 2. 初始化 PDF 实例
  const pdf = new jspdf({
    unit: unit, // 设置单位
    format: [pdfWidth, pdfHeight] // 设置 PDF 宽高
  });

// 3. 计算图片在 PDF 中的尺寸（可选：铺满 PDF 或自定义大小）
// 方案 A：图片铺满整个 PDF 页面（保持比例，避免拉伸）
// 先获取图片原始尺寸（通过 Image 对象加载）
  const img = new Image();
  img.src = base64Image;
  img.onload = function() {
    const imgWidth = this.width; // 图片原始宽（像素）
    const imgHeight = this.height; // 图片原始高（像素）

    // 计算图片在 PDF 中的缩放比例（确保宽高不超过 PDF 尺寸）
    const scaleX = pdfWidth / (imgWidth / 37.8); // 转换图片像素到 PDF 单位（1cm ≈ 37.8 像素）
    const scaleY = pdfHeight / (imgHeight / 37.8);
    const scale = Math.min(scaleX, scaleY); // 取最小缩放比例，避免超出页面

    // 计算缩放后的图片尺寸
    const scaledWidth = (imgWidth / 37.8) * scale;
    const scaledHeight = (imgHeight / 37.8) * scale;

    // 计算居中位置（可选：如需居中显示）
    const x = (pdfWidth - scaledWidth) / 2;
    const y = (pdfHeight - scaledHeight) / 2;

    // 4. 将图片添加到 PDF 中
    pdf.addImage(
        base64Image, // Base64 图片内容
        'JPEG', // 图片格式
        x, // 左上角 x 坐标（单位：cm）
        y, // 左上角 y 坐标（单位：cm）
        3, // 图片宽度（单位：cm）
        3 // 图片高度（单位：cm）
    );

    // 5. 导出 PDF（下载或获取 Blob）
    pdf.save('image-to-pdf.pdf'); // 下载 PDF
    // 若需获取 Blob 用于预览或上传：
    // const pdfBlob = pdf.output('blob');
  };
}

const toImagePrint = () => {
  const imageSrc = canvas.toDataURL({
    multiplier: multiplier.value, // 控制生成图片的清晰度   https://fabricjs.com/api/classes/staticcanvas/#todataurl
    quality: 1,
    format: 'jpeg',
  });

  // 2. 创建临时 img 元素
  // 只打印图片，不打印整个网页，使用 iframe 隔离打印内容
  const img = new Image();
  img.src = imageSrc;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.top = '-9999px';
  iframe.style.left = '-9999px';
  iframe.style.width = '0px';
  iframe.style.height = '0px';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);

  img.onload = function () {
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Print Image</title>
          <style>
            body, html { margin:0; padding:0; }
            img { width: 3cm; height: 3cm; display: inline-block; margin: 0 auto; }
          </style>
        </head>
        <body>
          <img src="${img.src}" />
        </body>
      </html>
    `);
    doc.close();

    // 等 iframe 渲染完毕再打印
    iframe.onload = function () {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      // 打印后移除 iframe
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 100);
    };

    // 某些浏览器不会触发iframe.onload，所以用 setTimeout 兜底
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 100);
    }, 300);
  };

}

// 生成文本
generateText(canvas);

onMounted(() => {
  canvasBox.value.appendChild(canvas.getElement());
});
</script>

<template>
  <div>
    <div ref="canvasBox"></div>
    <span>清晰度：</span><input type="text" v-model="multiplier">
    <!-- <button @click="downloadCanvas">fabric下载</button> -->
    <button @click="downloadLodop">lodop下载</button>
    <button @click="downloadPDF">PDF下载</button>
    <button @click="toImagePrint">转图片直接打印</button>
  </div>
</template>

<style scoped>
.canvasBox canvas {
  width: 150px;
  height: 450px;
}

</style>
