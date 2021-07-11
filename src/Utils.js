const Utils = {
  generateColor: function(alpha=1) {
    return `rgba(${this.generateInt(230, 100)},${this.generateInt(230, 100)},${this.generateInt(230, 100)},${alpha})`
  },
  generateInt: function(e, s=0) { return Math.floor(s + (Math.random() * (e-s)))},
  generateFloat: function(e, s=0) { return s + (Math.random() * (e-s))},
  generateId: function() {return Math.random().toString(36).substring(7)},
  unitCircle2canvasArc(radians) {
    return 2*Math.PI - radians
  },

  blendColors: function(colorA, colorB, amount) {
    const getValues = color => color.replace(/\(|\)+/g, '').replace("rgba", "").split(",").map(v => parseFloat(v))

    const colorAValues = getValues(colorA)
    const colorBValues = getValues(colorB)

    const colors = []
    for (let i=0;i<3;i++) colors.push(Math.round(((1-amount) * colorAValues[i]) + (amount * colorBValues[i])))

    const alpha = ((colorAValues.length === 4 ? colorAValues[3] : 1) + (colorBValues.length === 4 ? colorBValues[3] : 1))/2

    return `rgba(${colors[0]},${colors[1]},${colors[2]}, ${alpha})`
  }
}

export default Utils