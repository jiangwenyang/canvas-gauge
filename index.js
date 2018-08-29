/**
 * 刻度盘
 * @param {string} canvasId 
 * @param {number} percent 百分比（不带百分号）
 * @param {object} option 可选配置
 * @param {function} callback 每次重绘进度后调用的回调函数
 * @returns 
 */
function drawGauge(canvasId, percent, option, callback) {
    var canvas = document.getElementById(canvasId);
    if (!canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var cWidth = canvas.width;
    var cHeight = canvas.height;
    var config = {
        cx: cWidth / 2, // 原点x坐标
        cy: cHeight, // 原点y坐标
        startAngel: Math.PI, // 开始角度
        endAngel: Math.PI * 2, // 结束角度
        arc: {
            radius: cHeight, // 圆弧半径
            lineWidth: 12, // 圆弧宽度
        },
        tickMark: {
            number: 20, // 刻度线数量
            width: 2, // 刻度线宽度
            height: 2, // 刻度线高度
            radius: '', // 刻度线外半径,为空时默认刻度线在内部距进度条12px
            fixed: 0.005, // 分割偏移值（当Math.PI/number）导致精度不准确时的手动修复值
        },
        color: {
            0: '#fc391e', // [0%,60%) 颜色
            60: '#fda029', // [60%,80%) 颜色
            80: '#4ca3fc' // [80%-100%] 颜色
        },
        defaultColor: '#e5e5e5', // 默认颜色
        lineCap: 'round', // 圆弧尾部样式 ['butt'|'round'|'square']  https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/lineCap
    }
    option && (config = option) // TODO:考虑使用"解构赋值"进行局部覆盖
    var currentPercent = 0;
    var raf;

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
    function arc(ctx, radius, startAngel, endAngel, lineWidth, color, lineCap) {
        ctx.save()
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = lineCap ? lineCap : 'round';
        // ctx.shadowOffsetX = 2;
        // ctx.shadowOffsetY = 0;
        // ctx.shadowBlur = 2;
        // ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
        ctx.beginPath();
        ctx.arc(0, 0, radius - lineWidth, startAngel, endAngel, false)
        ctx.stroke()
        ctx.restore()
    }

    /**
     * 画刻度
     * @param {*} total 刻度总数
     * @param {*} number 当前刻度
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
    function tickMark(total, number, ctx, radius, startAngel, endAngel, lineWidth, lineHeight, color, lineCap, fixed) {
        var gapAngle = (Math.abs(endAngel - startAngel) / total) + (fixed ? fixed : 0)
        var startY = radius;
        var endY = startY - lineHeight;
        ctx.save()
        ctx.rotate(-Math.PI / 2 + startAngel)
        for (var i = 0; i < number; i++) {
            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.lineCap = lineCap ? lineCap : 'round';
            // ctx.shadowOffsetX = 1;
            // ctx.shadowOffsetY = 0;
            // ctx.shadowBlur = 1;
            // ctx.shadowColor = "rgba(0, 0, 0, 0.1)";
            ctx.beginPath()
            ctx.moveTo(0, startY)
            ctx.lineTo(0, endY)
            ctx.stroke();
            ctx.rotate(gapAngle);
        }
        ctx.restore()
    }

    /**
     * 画底层背景
     */
    function drawCover() {
        var tickMarkRadius = config.tickMark.radius ? config.tickMark.radius : (config.arc.radius - config.arc.lineWidth - 14)
        arc(ctx, config.arc.radius - 2, config.startAngel, config.endAngel, config.arc.lineWidth, config.defaultColor)
        tickMark(config.tickMark.number, config.tickMark.number, ctx, tickMarkRadius, config.startAngel, config.endAngel, config.tickMark.width, config.tickMark.height, config.defaultColor, config.lineCap, config.tickMark.fixed)
    }

    /**
     * 画进度
     * @param {number} percent
     */
    function drawProgress(percent) {
        if (percent <= 0) return;
        if (percent >= 100) percent = 100;
        var tickMarkRadius = config.tickMark.radius ? config.tickMark.radius : (config.arc.radius - config.arc.lineWidth - 14)
        var endAngel = config.startAngel + (percent / 100) * Math.abs((config.endAngel - config.startAngel));
        var currentScale = Math.ceil(percent / 100 * 20);
        var color = config.defaultColor
        Object.keys(config.color).forEach((key, index) => {
            percent > key && (color = config.color[key])
        });
        arc(ctx, config.arc.radius - 2, config.startAngel, endAngel, config.arc.lineWidth, color)
        tickMark(config.tickMark.number, currentScale, ctx, tickMarkRadius, config.startAngel, config.endAngel, config.tickMark.width, config.tickMark.height, color, config.lineCap, config.tickMark.fixed)
    }


    /**
     * 绘制
     */
    function draw() {
        ctx.save()
        ctx.clearRect(0, 0, cWidth, cHeight)
        config.arc.lineCap === 'round' || 'square' ? ctx.translate(config.cx, config.cy - config.arc.lineWidth / 2) : ctx.translate(config.cx, config.cy)
        drawCover()
        drawProgress(currentPercent)
        callback && callback(currentPercent)
        ctx.restore()
        if (currentPercent < percent) {
            currentPercent++
            raf = window.requestAnimationFrame(draw)
        } else {
            window.cancelAnimationFrame(raf);
        }
    }

    draw()
}