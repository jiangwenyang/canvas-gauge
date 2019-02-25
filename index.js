/**
 * 刻度盘
 * @export
 * @param {string} canvasId
 * @param {number} percent 百分比（不带百分号）
 * @param {object} option 可选配置
 * @param {function} callback 每次重绘进度后调用的回调函数
 * @returns
 */
export function drawGauge(canvasId, percent, option = {}, callback) {
  const canvas = document.getElementById(canvasId)
  if (!canvas.getContext) return
  const ctx = canvas.getContext('2d')
  const cWidth = canvas.width
  const cHeight = canvas.height
  const defaultconfig = {
    cx: cWidth / 2, // 原点x坐标
    cy: cHeight / 2, // 原点y坐标
    startAngel: -Math.PI / 2, // 开始角度
    endAngel: (Math.PI * 3) / 2, // 结束角度
    arc: {
      radius: cHeight / 2, // 圆弧半径
      lineWidth: 12 // 圆弧宽度
    },
    showTickMark: false, // 是否显示刻度
    tickMark: {
      number: 20, // 刻度线数量
      width: 2, // 刻度线宽度
      height: 2, // 刻度线高度
      radius: '', // 刻度线外半径,为空时默认刻度线在内部距进度条12px
      fixed: 0.005 // 分割偏移值（当Math.PI/number）导致精度不准确时的手动修复值
    },
    color: {
      0: '#fc391e', // [0%,60%) 颜色
      60: '#fda029', // [60%,80%) 颜色
      80: '#4ca3fc' // [80%-100%] 颜色
    },
    showPercent: true, // 是否显示百分比数值
    percentFont: '36px Arial', // 百分比数值字体，同CSS font属性
    percentOffsetTop: -10, // 百分比数值距离坐标原点竖直偏移量
    label: '', // 标题文字
    labelFont: '18px Arial', // 标题文字字体，同CSS font属性
    labelOffsetTop: 30, // 标题文字距离坐标原点竖直偏移量
    defaultColor: '#e5e5e5', // 默认颜色
    lineCap: 'round' // 圆弧尾部样式 ['butt'|'round'|'square']  https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/lineCap
  }

  let config = { ...defaultconfig, ...option },
    currentPercent = 0,
    raf = null

  /**
   * 画圆弧
   * @param {object} ctx canvas上下文
   * @param {number} radius 外半径
   * @param {number} startAngel 开始角度
   * @param {number} endAngel 结束角度
   * @param {number} lineWidth 线宽
   * @param {string} color 颜色
   * @param {string} lineCap 线末端样式
   */
  function drawArc(
    ctx,
    radius,
    startAngel,
    endAngel,
    lineWidth,
    color,
    lineCap
  ) {
    ctx.save()
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.lineCap = lineCap ? lineCap : 'round'
    // ctx.shadowOffsetX = 2;
    // ctx.shadowOffsetY = 0;
    // ctx.shadowBlur = 2;
    // ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
    ctx.beginPath()
    ctx.arc(0, 0, radius - lineWidth, startAngel, endAngel, false)
    ctx.stroke()
    ctx.restore()
  }

  /**
   * 画刻度
   * @param {number} total 刻度总数
   * @param {number} number 当前刻度
   * @param {object} ctx canvas上下文
   * @param {number} radius 外半径
   * @param {number} startAngel 开始角度
   * @param {number} endAngel 结束角度
   * @param {number} lineWidth 线宽
   * @param {number} lineHeight 线高
   * @param {string} color 颜色
   * @param {string} lineCap 线末端样式
   * @param {number} fixed 分割修复
   */
  function drawTickMark(
    total,
    number,
    ctx,
    radius,
    startAngel,
    endAngel,
    lineWidth,
    lineHeight,
    color,
    lineCap,
    fixed
  ) {
    const gapAngle =
        Math.abs(endAngel - startAngel) / total + (fixed ? fixed : 0),
      startY = radius,
      endY = startY - lineHeight
    ctx.save()
    ctx.rotate(-Math.PI / 2 + startAngel)
    for (const i = 0; i < number; i++) {
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
      ctx.lineCap = lineCap ? lineCap : 'round'
      // ctx.shadowOffsetX = 1;
      // ctx.shadowOffsetY = 0;
      // ctx.shadowBlur = 1;
      // ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
      ctx.beginPath()
      ctx.moveTo(0, startY)
      ctx.lineTo(0, endY)
      ctx.stroke()
      ctx.rotate(gapAngle)
    }
    ctx.restore()
  }

  /**
   * 画底层背景
   */
  function drawCover() {
    const tickMarkRadius = config.tickMark.radius
      ? config.tickMark.radius
      : config.arc.radius - config.arc.lineWidth - 14
    drawArc(
      ctx,
      config.arc.radius - 2,
      config.startAngel,
      config.endAngel,
      config.arc.lineWidth,
      config.defaultColor
    )
    config.showTickMark &&
      drawTickMark(
        config.tickMark.number,
        config.tickMark.number,
        ctx,
        tickMarkRadius,
        config.startAngel,
        config.endAngel,
        config.tickMark.width,
        config.tickMark.height,
        config.defaultColor,
        config.lineCap,
        config.tickMark.fixed
      )
  }

  // 绘制百分比数值
  function drawPercent(percent) {
    ctx.save()
    ctx.font = config.percentFont
    const text = ctx.measureText(`${percent}%`)
    ctx.fillText(`${percent}%`, -text.width / 2, config.percentOffsetTop)
    ctx.restore()
  }

  // 绘制标题文字
  function drawLabel() {
    ctx.save()
    ctx.font = config.labelFont
    const text = ctx.measureText(config.label)
    ctx.fillText(config.label, -text.width / 2, config.labelOffsetTop)
    ctx.restore()
  }

  /**
   * 画进度
   * @param {number} percent
   */
  function drawProgress(percent) {
    if (percent <= 0) {
      config.showPercent && drawPercent(percent)
      return
    }
    if (percent >= 100) percent = 100
    const tickMarkRadius = config.tickMark.radius
        ? config.tickMark.radius
        : config.arc.radius - config.arc.lineWidth - 14,
      endAngel =
        config.startAngel +
        (percent / 100) * Math.abs(config.endAngel - config.startAngel),
      currentScale = Math.ceil((percent / 100) * 20)
    let color = config.defaultColor
    Object.keys(config.color).forEach((key, index) => {
      percent > key && (color = config.color[key])
    })

    config.showPercent && drawPercent(percent)

    drawArc(
      ctx,
      config.arc.radius - 2,
      config.startAngel,
      endAngel,
      config.arc.lineWidth,
      color
    )
    config.showTickMark &&
      drawTickMark(
        config.tickMark.number,
        currentScale,
        ctx,
        tickMarkRadius,
        config.startAngel,
        config.endAngel,
        config.tickMark.width,
        config.tickMark.height,
        color,
        config.lineCap,
        config.tickMark.fixed
      )
  }

  /**
   * 绘制
   */
  function draw() {
    ctx.save()
    ctx.clearRect(0, 0, cWidth, cHeight)
    config.arc.lineCap === 'round' || 'square'
      ? ctx.translate(config.cx, config.cy - config.arc.lineWidth / 2)
      : ctx.translate(config.cx, config.cy)

    config.label && drawLabel()

    drawCover()
    drawProgress(currentPercent)
    callback && callback(currentPercent)
    ctx.restore()
    if (currentPercent < percent) {
      currentPercent++
      raf = window.requestAnimationFrame(draw)
    } else {
      window.cancelAnimationFrame(raf)
    }
  }

  draw()
}
