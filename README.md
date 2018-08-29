# canvas-gauge
使用canvas实现的可配置的刻度盘
## 使用
1. 通过script标签引入
2. 调用drawGuage()
``` html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>
    <script src="cavas-guage/index.js"></script> <!-- 引入drawGauge -->
</head>
<body>
    <canvas id="myCanvas"></canvas>
    <script>
        drawGauge('myCanvas',90)
    </script>
</body>
</html>
```
## 参数
- @param {string} canvasId canvas元素的id
- @param {number} percent 百分比（不带百分号）
- @param {object} option 可选配置
- @param {function} callback 每次重绘进度后调用的回调函数

### option参考
``` js
{
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
```
