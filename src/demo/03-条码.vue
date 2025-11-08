<script setup lang="ts">
import { ref, onMounted, shallowRef, watch } from "vue";
import { StaticCanvas, FabricText, Point, Rect, Image as FabricImage } from "fabric";
import jspdf from "jspdf";
import PixelConverter from "@/utils/pixelConverter";
import bwipjs from "bwip-js";
import QRCode from "qrcode";

const multiplier = ref(5);
const canvasBox = ref();
const physicsWidth = 3;
const physicsHeight = 6;
const canvasWidth = PixelConverter.mmToPx(physicsWidth * 10);
const canvasHeight = PixelConverter.mmToPx(physicsHeight * 10);
const canvas = new StaticCanvas(null, {
  backgroundColor: "#fff", // 设置白色背景
  width: canvasWidth,
  height: canvasHeight,
});

const barcodeText = ref("0123456789");
const barcodeImage = shallowRef<InstanceType<typeof FabricImage> | null>(null);
const isGeneratingBarcode = ref(false);
const barcodeError = ref("");

const qrcodeText = ref("https://fanqie365.cn/");
const qrcodeImage = shallowRef<InstanceType<typeof FabricImage> | null>(null);
const isGeneratingQRCode = ref(false);
const qrcodeError = ref("");

const generateQRCode = async () => {
  if (!qrcodeText.value) {
    qrcodeError.value = "请输入二维码内容";
    return;
  }

  qrcodeError.value = "";
  isGeneratingQRCode.value = true;

  try {
    // const qrcodeBase64 = await QRCode.toDataURL(qrcodeText.value, {
      
    // });
    const qrcodeWidth = 26;
    const qrcodeHeight = 26;
    const offlineCanvas = document.createElement("canvas");
    offlineCanvas.width = qrcodeWidth;
    offlineCanvas.height = qrcodeHeight;
    // const qrcodeBase64 = (await QRCode.toCanvas(offlineCanvas, qrcodeText.value)).toDataURL();
    // console.log('qrcodeBase64', qrcodeBase64);
    const qrcodeBase64 = await QRCode.toDataURL(qrcodeText.value, {
      width: PixelConverter.mmToPx(qrcodeWidth),  // 二维码宽度，单位：
      // height: qrcodeHeight,
      // scale:16,
    });

    const image = await FabricImage.fromURL(qrcodeBase64);
    const qrcodeWidthPx = PixelConverter.mmToPx(qrcodeWidth);
    const qrcodeHeightPx = PixelConverter.mmToPx(qrcodeHeight);

    const scaleX = qrcodeWidthPx / image.width;
    const scaleY = qrcodeHeightPx / image.height;

    image.set({
      left: PixelConverter.ptToPx(2),
      top: PixelConverter.ptToPx(100),
      scaleX,
      scaleY,
      objectCaching: false,
    });

    if (qrcodeImage.value) {
      canvas.remove(qrcodeImage.value);
    }

    qrcodeImage.value = image;
    canvas.add(qrcodeImage.value);
    canvas.renderAll();
  } catch (err) {
    console.log('err', err);
    
    qrcodeError.value = "无法生成二维码";
  } finally {
    isGeneratingQRCode.value = false;
  }
};

const generateText = (canvas) => {
  const data = [
    {
      text: "打印测试:6号文本黑体",
      fontSize: PixelConverter.ptToPx(6),
      fontFamily: "黑体",
      top: PixelConverter.ptToPx(1),
      left: 2,
    },
    {
      text: "打印测试:8号文本黑体",
      fontSize: PixelConverter.ptToPx(8),
      fontFamily: "黑体",
      top: PixelConverter.ptToPx(8),
      left: 2,
    },
    {
      text: "打印测试:10号文本黑体",
      fontSize: PixelConverter.ptToPx(10),
      fontFamily: "黑体",
      top: PixelConverter.ptToPx(18),
      left: 2,
    },
    {
      text: "打印测试:10号加粗黑体",
      fontSize: PixelConverter.ptToPx(10),
      fontFamily: "黑体",
      top: PixelConverter.ptToPx(30),
      left: 2,
      fontWeight: "bold",
    },
    {
      text: "打印测试:12号文本黑体",
      fontSize: PixelConverter.ptToPx(12),
      fontFamily: "黑体",
      top: PixelConverter.ptToPx(44),
      left: 2,
    },
    {
      text: "打印测试:12号文本加粗",
      fontSize: PixelConverter.ptToPx(12),
      fontFamily: "黑体",
      fontWeight: "bold",
      top: PixelConverter.ptToPx(58),
      left: 2,
    },
  ];

  data.forEach((textInfo) => {
    const text = new FabricText(textInfo.text, {
      fontSize: textInfo.fontSize,
      fontFamily: textInfo.fontFamily,
      top: textInfo.top,
      left: textInfo.left,
      fontWeight: textInfo.fontWeight,
    });
    canvas.add(text);
  });
};

const generateBarcode = async () => {
  if (!barcodeText.value) {
    barcodeError.value = "请输入条码内容";
    return;
  }

  const barcodeWidth = 26;
  const barcodeHeight = 10;
  barcodeError.value = "";
  isGeneratingBarcode.value = true;

  const offscreenCanvas = document.createElement("canvas");

  try {
    bwipjs.toCanvas(offscreenCanvas, {
      bcid: "code128",
      text: barcodeText.value,
      scale: Math.max(3, Math.ceil(window.devicePixelRatio || 1) * 3),
      height: barcodeHeight, // 条码高度，单位：毫米
      width: barcodeWidth, // 条码宽度，单位：毫米
      includetext: true,
      textyoffset: 4,        // 文字额外向下偏移2点（可选）
      textsize: 12,           // 文字大小（单位：点，默认8）
      textxalign: "center",
      textfont: '黑体',
    });
  } catch (err) {
    barcodeError.value =
      err instanceof Error ? err.message : "条码生成失败，请检查输入内容";
    isGeneratingBarcode.value = false;
    return;
  }

  const dataUrl = offscreenCanvas.toDataURL("image/png");

  try {
    const img = await FabricImage.fromURL(dataUrl);
    const barcodeWidthPx = PixelConverter.mmToPx(barcodeWidth);
    const barcodeHeightPx = PixelConverter.mmToPx(barcodeHeight);

    const scaleX = barcodeWidthPx / img.width;
    const scaleY = barcodeHeightPx / img.height;

    img.set({
      left: PixelConverter.ptToPx(2),
      top: PixelConverter.ptToPx(72),
      scaleX,
      scaleY,
      objectCaching: false,
    });

    if (barcodeImage.value) {
      canvas.remove(barcodeImage.value);
    }

    barcodeImage.value = img;
    canvas.add(img);
    canvas.renderAll();
  } catch (err) {
    barcodeError.value = "无法加载条码图像";
  } finally {
    isGeneratingBarcode.value = false;
  }
};

const downloadPDF = () => {
  const base64Image = canvas.toDataURL({
    multiplier: multiplier.value, // 控制生成图片的清晰度   https://fabricjs.com/api/classes/staticcanvas/#todataurl
    quality: 1,
    format: "jpeg",
  });

  console.log("base64Image", base64Image);

  // 1. 定义 PDF 尺寸（示例：宽 10cm，高 15cm，也可使用 'mm'、'px' 等单位）
  const unit = "cm"; // 单位：厘米（可选 'mm'/'px'/'in'）

  // 2. 初始化 PDF 实例
  const pdf = new jspdf({
    unit: unit, // 设置单位
    format: [physicsWidth, physicsHeight], // 设置 PDF 宽高
  });

  // 3. 计算图片在 PDF 中的尺寸（可选：铺满 PDF 或自定义大小）
  // 方案 A：图片铺满整个 PDF 页面（保持比例，避免拉伸）
  // 先获取图片原始尺寸（通过 Image 对象加载）
  const imgElement = new window.Image();
  imgElement.src = base64Image;
  imgElement.onload = () => {
    const imgWidth = imgElement.width; // 图片原始宽（像素）
    const imgHeight = imgElement.height; // 图片原始高（像素）

    // 计算图片在 PDF 中的缩放比例（确保宽高不超过 PDF 尺寸）
    const scaleX = physicsWidth / (imgWidth / 37.8); // 转换图片像素到 PDF 单位（1cm ≈ 37.8 像素）
    const scaleY = physicsHeight / (imgHeight / 37.8);
    const scale = Math.min(scaleX, scaleY); // 取最小缩放比例，避免超出页面

    // 计算缩放后的图片尺寸
    const scaledWidth = (imgWidth / 37.8) * scale;
    const scaledHeight = (imgHeight / 37.8) * scale;

    // 计算居中位置（可选：如需居中显示）
    const x = (physicsWidth - scaledWidth) / 2;
    const y = (physicsHeight - scaledHeight) / 2;

    // 4. 将图片添加到 PDF 中
    pdf.addImage(
      base64Image, // Base64 图片内容
      "JPEG", // 图片格式
      x, // 左上角 x 坐标（单位：cm）
      y, // 左上角 y 坐标（单位：cm）
      physicsWidth, // 图片宽度（单位：cm）
      physicsHeight // 图片高度（单位：cm）
    );

    // 5. 导出 PDF（下载或获取 Blob）
    pdf.save("image-to-pdf.pdf"); // 下载 PDF
    // 若需获取 Blob 用于预览或上传：
    // const pdfBlob = pdf.output('blob');
  };
};

const toImagePrint = () => {
  const imageSrc = canvas.toDataURL({
    multiplier: multiplier.value, // 控制生成图片的清晰度   https://fabricjs.com/api/classes/staticcanvas/#todataurl
    quality: 1,
    format: "jpeg",
  });

  // 2. 创建临时 img 元素
  // 只打印图片，不打印整个网页，使用 iframe 隔离打印内容
  const imgElement = new window.Image();
  imgElement.src = imageSrc;

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.top = "-9999px";
  iframe.style.left = "-9999px";
  iframe.style.width = "0px";
  iframe.style.height = "0px";
  iframe.style.visibility = "hidden";
  document.body.appendChild(iframe);

  imgElement.onload = () => {
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Print Image</title>
          <style>
            body, html { margin:0; padding:0; }
            img { width: ${physicsWidth}cm; height: ${physicsHeight}cm; display: inline-block; margin: 0 auto; }
          </style>
        </head>
        <body>
          <img src="${imgElement.src}" />
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
};

const downloadLodop = () => {
  const imageSrc = canvas.toDataURL({
    multiplier: multiplier.value,
    quality: 1,
    format: "jpeg",
  });

  if (window.CLODOP) {
    window.CLODOP.PRINT_INIT?.("barcode-print");
    window.CLODOP.ADD_PRINT_IMAGE(0, 0, "100%", "100%", `<img src="${imageSrc}" />`);
    window.CLODOP.PRINT();
  } else {
    console.warn("未检测到 CLODOP 打印控件");
  }
};

// 生成文本
generateText(canvas);

onMounted(async () => {
  canvasBox.value.appendChild(canvas.getElement());
  await generateBarcode();
  await generateQRCode();
});
</script>

<template>
  <div>
    <div ref="canvasBox"></div>
    <span>清晰度：</span><input type="text" v-model="multiplier" />
    <!-- <button @click="downloadCanvas">fabric下载</button> -->
    <button @click="downloadLodop">lodop下载</button>
    <button @click="downloadPDF">PDF下载</button>
    <button @click="toImagePrint">转图片直接打印</button>
    <div class="controls">
      <label class="controls__label" for="barcode-input">条码内容：</label>
      <input
        id="barcode-input"
        v-model.trim="barcodeText"
        type="text"
        class="controls__input"
        placeholder="请输入条码字符串"
      />
      <button
        class="controls__button"
        @click="generateBarcode"
        :disabled="isGeneratingBarcode"
      >
        {{ isGeneratingBarcode ? "生成中..." : "生成条码" }}
      </button>
    </div>
    <p v-if="barcodeError" class="controls__error">{{ barcodeError }}</p>
    <div class="controls">
      <label class="controls__label" for="qrcode-input">二维码内容：</label>
      <input
        id="qrcode-input"
        v-model.trim="qrcodeText"
        type="text"
        class="controls__input"
        placeholder="请输入二维码字符串"
      />
      <button
        class="controls__button"
        @click="generateQRCode"
        :disabled="isGeneratingQRCode"
      >
        {{ isGeneratingQRCode ? "生成中..." : "生成二维码" }}
      </button>
    </div>
    <p v-if="qrcodeError" class="controls__error">{{ qrcodeError }}</p>
  </div>
</template>

<style scoped>
.canvasBox canvas {
  width: 150px;
  height: 450px;
}

.controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.controls__label {
  white-space: nowrap;
}

.controls__input {
  flex: 1;
  min-width: 180px;
  padding: 4px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.controls__button {
  padding: 4px 10px;
  border: none;
  border-radius: 4px;
  background-color: #409eff;
  color: #fff;
  cursor: pointer;
}

.controls__button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.controls__error {
  color: #f56c6c;
  margin: 0 0 12px;
}
</style>
