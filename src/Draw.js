import Utils from './Utils.js'
import Gravity from './Gravity.js'

const Draw = {
  drawCircle: function(context, x, y, radius, start = 0, end = 2*Math.PI, color = "black") {
    context.strokeStyle = color
    context.beginPath()
    context.arc(x, y, radius, Utils.unitCircle2canvasArc(start), Utils.unitCircle2canvasArc(end), color, true)
    context.stroke()
  },

  drawLine: function(context, startX, startY, endX, endY, color = "black") {
    context.strokeStyle = color

    context.beginPath()
    context.moveTo(startX, startY)
    context.lineTo(endX, endY)
    context.stroke()
  },

  drawArrow: function(context, vector, centerX, centerY, radius) {
    const diameter = 2 * radius

    const hypothenuse = Math.hypot(vector.x, vector.y)
    const ratio = diameter/hypothenuse

    const totalWidth = vector.x * ratio
    const totalHeight = vector.y * ratio

    let startX, endX, startY, endY

    startX = centerX - totalWidth/2
    endX = centerX + totalWidth/2

    startY = centerY - totalHeight/2
    endY = centerY + totalHeight/2
    

    // line
    this.drawLine(context, startX, startY, endX, endY)
    
    // arrowhead
    const headlen = 3; // length of head in pixels
    const dx = endX - startX;
    const dy = endY - startY;
    const angle = Math.atan2(dy, dx);
    
    this.drawLine(context, endX, endY, endX - headlen * Math.cos(angle - Math.PI / 6), endY - headlen * Math.sin(angle - Math.PI / 6))
    this.drawLine(context, endX, endY, endX - headlen * Math.cos(angle + Math.PI / 6), endY - headlen * Math.sin(angle + Math.PI / 6))

  },

  drawBar: function(context, startX, startY, width, height, maxWidth, color = "black") {
    context.fillStyle = color

    context.beginPath()
    context.rect(startX, startY, maxWidth, height)
    context.stroke();
  
    context.beginPath()
    context.fillRect(startX, startY, width, height)
  },

  drawText: function(context, startX, startY, text, font = "small-caps 10px Arial") {
    context.font = font;
    context.fillText(text, startX, startY);
  },

  drawPlanet: function(context, planet) {
    if (planet.label.type === "collision") {
      for (let collisions of planet.label.bodies) {
        this.drawCircle(context, planet.position.x, planet.position.y, planet.radius, collisions[0], collisions[1], planet.color)
      }
    } else {
      this.drawCircle(context, planet.position.x, planet.position.y, planet.radius, 0, 2*Math.PI, planet.color)
    }
  },

  drawAcceleration: function(context, planet, acceleration) {
    const arrowRadius = 5
    const centerX = planet.position.x - 60
    const centerY = planet.position.y - planet.radius - 7 - 2 * arrowRadius - 5

    this.drawArrow(context, acceleration.acceleration, centerX, centerY, arrowRadius)

    const magnitude = Math.hypot(acceleration.acceleration.x, acceleration.acceleration.y)
    const barHeight = arrowRadius

    const barWidth = (magnitude/acceleration.max) * (2 * arrowRadius + 1)
    const startX = centerX - arrowRadius
    const startY = centerY - arrowRadius - barHeight - 2

    this.drawBar(context, startX, startY, barWidth, barHeight, (2 * arrowRadius + 1))
    //this.drawText(context, centerX-3, centerY - 15, "a")
  },

  drawVelocity: function(context, planet, velocity) {
    const arrowRadius = 5
    const centerX = planet.position.x - 4 * arrowRadius - 60
    const centerY = planet.position.y - planet.radius - 7 - 2 * arrowRadius - 5

    this.drawArrow(context, planet.velocity, centerX, centerY, arrowRadius)

    const magnitude = Math.hypot(velocity.velocity.x, velocity.velocity.y)
    const barHeight = arrowRadius
    //const barWidth = ((magnitude - velocity.min)/(velocity.max - velocity.min)) * (2 * arrowRadius + 1)
    const barWidth = (magnitude/velocity.max) * (2 * arrowRadius + 1)
    const startX = centerX - arrowRadius
    const startY = centerY - arrowRadius - barHeight - 2

    this.drawBar(context, startX, startY, barWidth, barHeight, (2 * arrowRadius + 1))
    //this.drawText(context, centerX-3, centerY - 15, "v")
  },

  drawMomentum: function(context, planet, momentum) {
    const arrowRadius = 5
    const centerX = planet.position.x + 4 * arrowRadius - 60
    const centerY = planet.position.y - planet.radius - 7 - 2 * arrowRadius - 5


    const barHeight = arrowRadius
    //const barWidth = ((magnitude - velocity.min)/(velocity.max - velocity.min)) * (2 * arrowRadius + 1)
    const barWidthMomX = (momentum.momentum.x/momentum.max.x) * (2 * arrowRadius + 1)
    const barWidthMomY = (momentum.momentum.y/momentum.max.y) * (2 * arrowRadius + 1)

    const startX = centerX - arrowRadius
    const startY = centerY - arrowRadius - barHeight - 2

    this.drawBar(context, startX, startY, barWidthMomX, barHeight, (2 * arrowRadius + 1))
    this.drawBar(context, startX, startY + 2* barHeight, barWidthMomY, barHeight, (2 * arrowRadius + 1))
    //this.drawText(context, centerX-3, centerY - 15, "p")
  },

  drawContainer: function(context, planet) {
    const recWidth = 60
    const recHeight = 35
    
    const lineXStart = planet.position.x - 20
    const lineYStart = planet.position.y - planet.radius
    const lineXEnd   = lineXStart
    const lineYEnd   = lineYStart - 10
    const recXStart  = lineXEnd - recWidth
    const recYStart  = lineYEnd - recHeight
  

    this.drawLine(context, lineXStart, lineYEnd - 5, lineXStart + 20, lineYStart - 5)
    this.drawLine(context, lineXEnd, lineYEnd - 5, lineXEnd - 70, lineYEnd - 5)
  },

  drawInformationBar: function(context, planet, velocity, acceleration, momentum) {
    this.drawContainer(context, planet)
    this.drawVelocity(context, planet, velocity)
    this.drawAcceleration(context, planet, acceleration)
    this.drawMomentum(context, planet, momentum)
  },

  clearCanvas: function(context, canvasWidth, canvasHeight) {
    context.clearRect(0, 0, canvasWidth, canvasHeight)
    context.fillStyle = "#f5f5f5"
    context.fillRect(0, 0, canvasWidth, canvasHeight)
  },

  drawIntersections: function(context, intersections) {
    context.strokeStyle = "black"

    for (let oid in intersections) {
      for (let iid in intersections[oid]) {
        for (let intersection of intersections[oid][iid]) {
          this.drawCircle(intersection.x, intersection.y, 2, 0, 2 * Math.PI)
        }
      }
    }
  },

  drawEyeCandy: function(context, eyeCandy) {
    for (let ec of eyeCandy) {
      this.drawCircle(context, ec.position.x, ec.position.y, ec.radius, 0, 2 * Math.PI, Utils.generateColor((1/ec.numFrames)*ec.remainingFrames))
    }
  },

  fillCanvas: function(context, state, canvasWidth, canvasHeight, showInformationBar, newPlanet) {
    const planets = state.planets
    const accelerations = planets.reduce((prev, planet) => ({...prev, [planet.id]: planet.acceleration}), {})
    const velocities = planets.reduce((prev, planet) => ({...prev, [planet.id]: planet.velocity}), {})

    const accelerationHypothenuses = Object.values(accelerations).map(a => Math.hypot(a.x, a.y))
    const minAcc = Math.min(...accelerationHypothenuses)
    const maxAcc = Math.max(...accelerationHypothenuses)

    const velocityHypothenuses = Object.values(velocities).map(v => Math.hypot(v.x, v.y))
    const minVel = Math.min(...velocityHypothenuses)
    const maxVel = Math.max(...velocityHypothenuses)

    const xMomentums = Object.values(planets).map(p => Math.abs(Gravity.getMomentum(p.velocity.x, p.mass)))
    const yMomentums = Object.values(planets).map(p => Math.abs(Gravity.getMomentum(p.velocity.y, p.mass)))

    const minMom = {
      x: Math.min(...xMomentums),
      y: Math.min(...yMomentums)
    }

    const maxMom = {
      x: Math.max(...xMomentums),
      y: Math.max(...yMomentums)
    }

    // draw

    this.clearCanvas(context, canvasWidth, canvasHeight)

    for (let planet of planets) {
      this.drawPlanet(context, planet)

      if (planet.id in accelerations) {
        const accObject = {
          min: minAcc,
          max: maxAcc,
          acceleration: accelerations[planet.id]
        }

        const velObject = {
          min: minVel,
          max: maxVel,
          velocity: velocities[planet.id]
        }

        const momObject = {
          min: minMom,
          max: maxMom,
          momentum: {
            x: Math.abs(Gravity.getMomentum(planet.velocity.x, planet.mass)),
            y: Math.abs(Gravity.getMomentum(planet.velocity.y, planet.mass))
          }
        }

        if (showInformationBar) {
          this.drawInformationBar(context, planet, velObject, accObject, momObject)
        }
      }
    }

    if (newPlanet) {
      this.drawPlanet(context, newPlanet)
    }

    this.drawEyeCandy(context, state.eyeCandy)
  }
}

export default Draw