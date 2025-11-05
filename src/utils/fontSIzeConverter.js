export default class PrintToHtmlConverter {
    // 默认打印机DPI（常见打印分辨率）
    static DEFAULT_PRINT_DPI = 300;
    
    // 标准单位换算
    static POINTS_PER_INCH = 72; // 1英寸 = 72磅
  
    /**
     * 获取屏幕DPI（自动检测）
     * @returns {number} 屏幕DPI值
     */
    static getScreenDPI() {
      // 如果已经缓存，直接返回
      if (this._screenDPI) {
        return this._screenDPI;
      }
  
      try {
        // 方法1：创建1英寸的元素测量物理尺寸
        const div = document.createElement('div');
        div.style.width = '1in';
        div.style.height = '0';
        div.style.padding = '0';
        div.style.margin = '0';
        div.style.border = 'none';
        div.style.position = 'absolute';
        div.style.left = '-100%';
        div.style.visibility = 'hidden';
        
        document.body.appendChild(div);
        const pixels = div.offsetWidth;
        document.body.removeChild(div);
        
        // 考虑设备像素比
        const dpi = pixels * window.devicePixelRatio;
        
        // 缓存结果
        this._screenDPI = dpi || 96;
        return this._screenDPI;
        
      } catch (error) {
        console.warn('无法自动获取屏幕DPI，使用默认值96');
        return 96;
      }
    }
  
    /**
     * 打印字体大小（磅）转HTML像素
     * @param {number} printFontSize - 打印字体大小（磅）
     * @param {number} printDpi - 打印机DPI，默认300
     * @returns {number} HTML像素值
     */
    static printFontSizeToHtml(printFontSize, printDpi = this.DEFAULT_PRINT_DPI) {
      // 参数验证
      if (typeof printFontSize !== 'number' || printFontSize <= 0) {
        throw new Error('打印字体大小必须是大于0的数字');
      }
      
      if (typeof printDpi !== 'number' || printDpi <= 0) {
        throw new Error('打印机DPI必须是大于0的数字');
      }
  
      // 获取屏幕DPI
      const screenDpi = this.getScreenDPI();
      
      // 转换公式：
      // 1. 将磅转换为英寸：points / 72
      // 2. 考虑DPI差异进行缩放：* (screenDpi / printDpi)
      // 3. 转换为像素：* screenDpi
      
      const inches = printFontSize / this.POINTS_PER_INCH;
      const scaleFactor = screenDpi / printDpi;
      const htmlPixels = inches * screenDpi * scaleFactor;
      
      return Math.round(htmlPixels * 100) / 100; // 保留2位小数
    }
  
    /**
     * 批量转换打印字体大小为HTML像素
     * @param {number[]} printSizes - 打印字体大小数组
     * @param {number} printDpi - 打印机DPI
     * @returns {number[]} HTML像素值数组
     */
    static batchPrintToHtml(printSizes, printDpi = this.DEFAULT_PRINT_DPI) {
      return printSizes.map(size => this.printFontSizeToHtml(size, printDpi));
    }
  
    /**
     * 重置屏幕DPI缓存（用于响应屏幕变化或DPI变化）
     */
    static resetScreenDPICache() {
      this._screenDPI = null;
    }
  
    /**
     * 获取当前转换器状态信息
     */
    static getConverterInfo() {
      return {
        screenDPI: this.getScreenDPI(),
        defaultPrintDPI: this.DEFAULT_PRINT_DPI,
        pointsPerInch: this.POINTS_PER_INCH
      };
    }
  }