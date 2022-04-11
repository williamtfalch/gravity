import Utils from './Utils.js'
import Geometry2D from './Geometry2D.js'

const Gravity = {
  positionPlanets: function(planets, w, h) {
    const movedPlanets = []

    for (let planet of planets) {
      const copiedPlanet = Object.assign({}, planet)

      const signX = Math.sign(planet.velocity.x)
      const signY = Math.sign(planet.velocity.y)

      copiedPlanet.position.x += planet.velocity.x
      copiedPlanet.position.y += planet.velocity.y

      // check if planet hit canvas bounds in x direction
      if (signX === 1) {
        if (copiedPlanet.position.x >= w - planet.radius) {
          copiedPlanet.position.x = w - planet.radius
          copiedPlanet.velocity.x = copiedPlanet.velocity.x * (-1)
        }
      } else {
        if (copiedPlanet.position.x <= planet.radius) {
          copiedPlanet.position.x =  planet.radius
          copiedPlanet.velocity.x = copiedPlanet.velocity.x * (-1)
        }
      }

      // check if planet hit canvas bounds in y direction
      if (signY === 1) {
        if (copiedPlanet.position.y >= h - planet.radius) {
          copiedPlanet.position.y = h - planet.radius
          copiedPlanet.velocity.y = copiedPlanet.velocity.y * (-1)
        }
      } else {
        if (copiedPlanet.position.y <= planet.radius) {
          copiedPlanet.position.y = planet.radius
          copiedPlanet.velocity.y = copiedPlanet.velocity.y * (-1)
        }
      }

      movedPlanets.push(copiedPlanet)
    }
    
    return movedPlanets
  },

  getMomentum: function(velocity, mass) {
    return velocity * mass
  },

  getUpdatedAccelerations: function(planets, G) {
    const gravitationalForceFn      = (m1,m2,r) => (G * (m1*m2))/Math.pow(r, 2)
    const accelerationFn            = (f, m) => f/m
    const accelerations             = {}

    for (let planet of planets) {
      accelerations[planet.id]      = {}
    }

    for (let i=0;i<planets.length;i++) {
      if (planets[i].label.type === "newborn") continue

      for (let j=0;j<planets.length;j++) {
        if (i === j || planets[j].label.type === "newborn") continue

        let diffX = planets[i].position.x - planets[j].position.x
        let diffY = planets[i].position.y - planets[j].position.y
        const signX = Math.sign(diffX)
        const signY = Math.sign(diffY)

        const r = Math.hypot(diffX, diffY)

        const f = gravitationalForceFn(planets[i].mass, planets[j].mass, r)
        const a = accelerationFn(f, planets[i].mass)

        //////

        if (signY === -1) diffY = -diffY
        let angle = Math.atan2(diffY, diffX) * 180 / Math.PI
        if (angle > 90) angle = 180 - angle

        let accelerationX = a * Math.cos(Geometry2D.degrees2radians(angle))  * (-signX)
        let accelerationY = a * Math.sin(Geometry2D.degrees2radians(angle))  * (-signY)

        accelerations[planets[i].id][planets[j].id] = {
          x: accelerationX,
          y: accelerationY
        }
      }
    }

    for (let id in accelerations) {
      const vals = Object.values(accelerations[id])
      
      accelerations[id] = {
        x: vals.reduce((a,b) => a + b.x, 0),
        y: vals.reduce((a,b) => a + b.y, 0)
      }
    }

    return accelerations
  },

  getUpdatedVelocities: function(planets, accelerations) {
    const velocities = {}

    for (let planet of planets) {
      const planetId = planet.id
      velocities[planetId] = {}

      for (let axis in accelerations[planetId]) {
        velocities[planetId][axis] = planet.velocity[axis] + accelerations[planetId][axis]
      }
    }

    return velocities
  },

  getPlanetRadius: mass => {
    return 5 + Math.floor((mass-100)/10)
  },

  updateKinematics: function(planets, velocities, accelerations) {
    const updatedPlanets = Object.assign([], planets)

    for (let i in updatedPlanets) {
      updatedPlanets[i].velocity = velocities[updatedPlanets[i].id]
      updatedPlanets[i].acceleration = accelerations[updatedPlanets[i].id]
    }

    return updatedPlanets
  },

  generatePlanet: function(planets, canvasWidth, canvasHeight, predecidedProperties = {}) {
    const mass = predecidedProperties.hasOwnProperty("mass") ? predecidedProperties.mass : Utils.generateFloat(430, 100)

    let planet = {
      mass,
      radius: this.getPlanetRadius(mass),
      id: Utils.generateId(),
      color: Utils.generateColor(),
      velocity: {
        x: Utils.generateFloat(0.3, -0.3),
        y: Utils.generateFloat(0.3, -0.3),
      },
      acceleration: {
        x: 0,
        y: 0,
      },
      label: {
        type: "planet"
      }
    }

    if (!predecidedProperties.hasOwnProperty("position")) {
      let dontHavePosition = true

      while (dontHavePosition) {
        dontHavePosition = false
        planet.position = {
          x: Utils.generateInt(canvasWidth - planet.radius, planet.radius),
          y: Utils.generateInt(canvasHeight - planet.radius, planet.radius)
        }

        if (planets.length > 0) {
          for (let p of planets) {
            if (Geometry2D.doCirclesIntersect(planet.position, p.position, planet.radius, p.radius)) {
              dontHavePosition = true
              break
            }
          }
        }
      }
    }

    planet = {...planet, ...predecidedProperties}

    return planet
  },

  generatePlanets: function(canvasWidth, canvasHeight, numPlanets) {
    const planets = []
    const r = 50

    const xCoordinates = Array(numPlanets).fill().map((v, i) => {
      const division = Math.floor(canvasWidth/numPlanets)
      const lb = i * division + r
      const ub = (i+1) * division - r

      return Utils.generateInt(ub, lb)
    })

    const yCoordinates = Array(numPlanets).fill().map((v, i) => {
      const division = Math.floor(canvasHeight/numPlanets)
      const lb = i * division + r
      const ub = (i+1) * division - r

      return Utils.generateInt(ub, lb)
    })

    for (let i=0;i<numPlanets;i++) {
      const xCoordinate = xCoordinates.splice(Utils.generateInt(xCoordinates.length), 1)[0]
      const yCoordinate = yCoordinates.splice(Utils.generateInt(yCoordinates.length), 1)[0]

      const planet = this.generatePlanet(planets, canvasWidth, canvasHeight, {
        position: {
          x: xCoordinate,
          y: yCoordinate
        },
        acceleration: {
          x: 0,
          y: 0
        }
      })

      planets.push(planet)
    }

    return planets
  },

  getIntersections: function(planets) {
    const intersections = {}

    for (let i=0;i<planets.length;i++) {
      if (planets[i].label.type === "newborn") continue

      for (let j=0;j<planets.length;j++) {
        if (i === j || planets[j].label.type === "newborn") continue

        if (Geometry2D.doCirclesIntersect(planets[i].position, planets[j].position, planets[i].radius, planets[j].radius)) {
          if (!intersections.hasOwnProperty(planets[i].id)) {
            intersections[planets[i].id] = {}
          }

          intersections[planets[i].id][planets[j].id] = Geometry2D.getCircleIntersectionPoints(planets[i].position.x, planets[i].position.y, planets[i].radius, planets[j].position.x, planets[j].position.y, planets[j].radius)
        }
      }
    }

    return intersections
  },

  filterIntersections: function(planets, intersections) {
    const collisions = {}
    const ids2index = planets.map((p, i) => [p.id, i])
    let id2index = {}
    for (let id2ind of ids2index) id2index[id2ind[0]] = id2ind[1]
    
    for (let planet of planets) {
      if (!intersections.hasOwnProperty(planet.id )) {
        continue
      }

      collisions[planet.id] = []

      for (let intersectee in intersections[planet.id]) {
        const pi = planets[id2index[intersectee]]

        if (planet.mass > pi.mass) continue

        const localIntersections = intersections[planet.id][intersectee]

        const rad1 = Geometry2D.point2radians(localIntersections[0], planet.position)
        const rad2 = Geometry2D.point2radians(localIntersections[1], planet.position)

        const radMin = Math.min(rad1, rad2)
        const radMax = Math.max(rad1, rad2)

        const midRadian = ((radMax-radMin)/2) + radMin
        const midPoint = Geometry2D.radians2point(midRadian, planet)

        if (Geometry2D.getDistance(pi.position, midPoint) > pi.radius) {
          collisions[planet.id].push([radMin, radMax])
        } else {
          collisions[planet.id] = collisions[planet.id].concat([
            [0, Geometry2D.point2radians(localIntersections[0], planet.position)],
            [Geometry2D.point2radians(localIntersections[1], planet.position), 2 * Math.PI]
          ])
        }
      }

      if (collisions[planet.id].length === 0) {
        collisions[planet.id] = [[0, 2 * Math.PI]]
      }
    }

    return collisions
  },

  mergeCollisions: function(collisions) {
    const mergedCollisions = {}
    const iterableCollisions = Object.assign({}, collisions)

    for (let id in iterableCollisions) {
      let localCollisions = iterableCollisions[id]
      let keepMerging = true

      mergedCollisions[id] = []
      localCollisions = localCollisions.sort((a,b) => (a[0] - b[0]))

      while (keepMerging) {
        keepMerging = false

        for (let i=0;i<localCollisions.length-1;i++) {
          if (localCollisions[i][1] > localCollisions[i+1][0]) {
            localCollisions[i] = [localCollisions[i][0], localCollisions[i+1][1]]
            localCollisions.splice(i+1, 1)

            keepMerging = true
            break
          }

          if (localCollisions[i][0] === localCollisions[i+1][0]) {
            localCollisions[i] = [localCollisions[i][0], Math.max(localCollisions[i][1], localCollisions[i+1][1])]
            localCollisions.splice(i+1, 1)

            keepMerging = true
            break
          }

          if (localCollisions[i][0] < localCollisions[i+1][0] && localCollisions[i][1] > localCollisions[i+1][1]) {
            localCollisions.splice(i+1, 1)

            keepMerging = true
            break
          }
        }
      }
      
      mergedCollisions[id] = localCollisions
    }

    return mergedCollisions
  },

  getCollisions: function(planets) {
    const intersections    = this.getIntersections(planets)
    const collisions       = this.filterIntersections(planets, intersections)
    const mergedCollisions = this.mergeCollisions(collisions)

    return [mergedCollisions, intersections]
  },

  labelPlanets: function(planets, collisions, canvasWidth, canvasHeight) {
    const labeledPlanets = Object.assign([], planets)

    for (let i=0;i<labeledPlanets.length;i++) {
      if (collisions.hasOwnProperty(labeledPlanets[i].id)) {
        labeledPlanets[i].label = {
          type: "collision",
          bodies: collisions[labeledPlanets[i].id]
        }
      } else if (labeledPlanets[i].label.type === "newborn") {
        if (!Geometry2D.isCircleWithinBounds(labeledPlanets[i], canvasWidth, canvasHeight)) continue

        let isOverlapping = false

        for (let j=0;j<labeledPlanets.length;j++) {
          if (i === j) continue

          if (Geometry2D.doCirlcesOverlap(labeledPlanets[i].position,labeledPlanets[j].position, labeledPlanets[i].radius,labeledPlanets[j].radius)) {
            isOverlapping = true
            break
          }
        }

        if (!isOverlapping) {
          labeledPlanets[i].label.remainingFrames = labeledPlanets[i].label.remainingFrames - 1

          if (labeledPlanets[i].label.remainingFrames <= 0) {
            labeledPlanets[i].color = Utils.generateColor()
            labeledPlanets[i].label = {
              type: "planet"
            }
          }
        }
      } else {
        labeledPlanets[i].label = {
          type: "planet"
        }
      }
    }

    return labeledPlanets
  },

  // this function is a hot mess but I can't be bothered to condense it
  mergePlanets: function(labeledPlanets, intersections, updateFrequency) {
    const mergedPlanets = Object.assign([], labeledPlanets)
    let eyeCandy = []
    const ids2planets = mergedPlanets.map(p => [p.id, p])
    let id2planet = {}
    for (let id2p of ids2planets) id2planet[id2p[0]] = id2p[1]

    for (let i=mergedPlanets.length-1;i >= 0;i--) {
      if (mergedPlanets[i].label.type === "collision") {
        const collisionees = intersections[mergedPlanets[i].id]
        const isBiggest = mergedPlanets[i].mass > Math.max(...Object.keys(collisionees).map(id => id2planet[id].mass))

        if (isBiggest) continue

        for (let collisionee in collisionees) {
          const overlappingArea = Geometry2D.getAreaOfOverlappingCircles(mergedPlanets[i].radius, id2planet[collisionee].radius, Geometry2D.getDistance(mergedPlanets[i].position, id2planet[collisionee].position))
          const smallerCircleArea = Geometry2D.getCircleArea(mergedPlanets[i].radius)
          const threshold = 0.3

          // HIT
          if (overlappingArea/smallerCircleArea > threshold) {
            for (let j=0;j<mergedPlanets.length;j++) {
              if (mergedPlanets[j].id !== collisionee) {
                continue
              }
              
              const momentumXI = this.getMomentum(mergedPlanets[i].velocity.x, mergedPlanets[i].mass)
              const momentumYI = this.getMomentum(mergedPlanets[i].velocity.y, mergedPlanets[i].mass)

              const updatedVelX = mergedPlanets[j].velocity.x + momentumXI/mergedPlanets[j].mass
              const updatedVelY = mergedPlanets[j].velocity.y + momentumYI/mergedPlanets[j].mass

              mergedPlanets[j].velocity = {
                x: updatedVelX,
                y: updatedVelY
              }

              const numFrames = 10 * updateFrequency

              
              mergedPlanets[j].addition = {
                remainingFrames: numFrames,
                numFrames: numFrames,
                originalColor: mergedPlanets[j].color,
                mergeColor: mergedPlanets[i].color,
                deltaMass: (0.1 * (mergedPlanets[i].mass - 100))/numFrames
              }
              

              // add eye candy

              const intersectionPoints = collisionees[collisionee]

              const rad1 = Geometry2D.point2radians(intersectionPoints[0], mergedPlanets[j].position)
              const rad2 = Geometry2D.point2radians(intersectionPoints[1], mergedPlanets[j].position)

              const radMin = Math.min(rad1, rad2)
              const radMax = Math.max(rad1, rad2)
              const distanceToTwoPI = (2 * Math.PI) - radMax

              const meanLeft = radMin + ((radMax-radMin)/2)
              const pointLeft = Geometry2D.radians2point(meanLeft, mergedPlanets[j])

              let start
              let diff
              
              if (Geometry2D.getDistance(pointLeft, mergedPlanets[i].position) < Geometry2D.getDistance(pointLeft, mergedPlanets[j].position)) {
                start = radMin
                diff = radMax - radMin
              } else {
                start = radMax
                diff = distanceToTwoPI + radMin
              }

              const numEyeCandy = Math.ceil(mergedPlanets[i].radius * 2 * Math.random()/2)

              eyeCandy = eyeCandy.concat(Array(numEyeCandy).fill().map( _ => {
                const radius = (Math.random() * diff) + (0.5 * diff)
                const midRadian = (start + radius + (Math.random() * (diff - (2 * radius))))%(2*Math.PI)
                const position = Geometry2D.radians2point(midRadian, mergedPlanets[j])
                const quadrant = Geometry2D.radians2quadrant(midRadian)

                const newEyeCandy = {
                  radius: radius,
                  position: position,
                  velocity: {
                    x: updatedVelX + 0.2 * (quadrant === 1 || quadrant === 4 ? 1 : -1) + Math.random(),
                    y: updatedVelY + 0.2 * (quadrant === 1 || quadrant === 2 ? -1 : 1) + + Math.random()
                  },
                  remainingFrames: (5 * updateFrequency),
                  numFrames: (5 * updateFrequency)
                }

                return newEyeCandy
              }))

              break
            }

            mergedPlanets.splice(i, 1)
            break
          }
        }
      }
    }

    return [mergedPlanets, eyeCandy]
  },

  updateStructure: function(planets) {
    const updatedPlanets = Object.assign([], planets)
    
    for (let i=0;i<planets.length;i++) {
      if (updatedPlanets[i].hasOwnProperty("addition")) {
        if (updatedPlanets[i].addition.remainingFrames > 0) {
          updatedPlanets[i].mass                     += updatedPlanets[i].addition.deltaMass
          updatedPlanets[i].radius                    = this.getPlanetRadius(updatedPlanets[i].mass)
          updatedPlanets[i].addition.remainingFrames -= 1
          updatedPlanets[i].color                     = Utils.blendColors(updatedPlanets[i].addition.originalColor, updatedPlanets[i].addition.mergeColor, 0.3 * (1 - (updatedPlanets[i].addition.remainingFrames/updatedPlanets[i].addition.numFrames)))
        } else {
          delete updatedPlanets[i].addition
        }
      }
    }

    return updatedPlanets
  },

  updateEyeCandy: function(current, additional) {
    let updatedEyeCandy = Object.assign([], current)

    for (let i=updatedEyeCandy.length-1;i>=0;i--) {
      updatedEyeCandy[i].position = {
        x: updatedEyeCandy[i].position.x + updatedEyeCandy[i].velocity.x,
        y: updatedEyeCandy[i].position.y + updatedEyeCandy[i].velocity.y
      }

      updatedEyeCandy[i].remainingFrames = updatedEyeCandy[i].remainingFrames - 1

      if (updatedEyeCandy[i].remainingFrames === 0) {
        updatedEyeCandy.splice(i, 1)
      }
    }

    updatedEyeCandy = updatedEyeCandy.concat(additional)

    return updatedEyeCandy
  },

  possiblyCreateNewPlanet: function(planets, w, h, newPlanetFrequency, updateFrequency) {
    let planet                 = false
    const newPlanetProbability = newPlanetFrequency / updateFrequency

    if (Math.random() < newPlanetProbability) {
      const mass               = Utils.generateInt(500, 120)
      const radius             = this.getPlanetRadius(mass)

      const xInside            = (Math.random() > 0.5 ? true : false)
      const yInside            = !xInside

      const properties         = {}
      properties.position      = {
        x: (xInside ? Utils.generateInt(w  - radius, radius) : (Math.random() > 0.5 ? w + radius : -radius)),
        y: (yInside ? Utils.generateInt(h - radius, radius) : (Math.random() > 0.5 ? h + radius : -radius)),
      }
      properties.velocity = {
        x: Utils.generateFloat(0.3, 0.15) * (Math.sign(properties.position.x) === 1 ? -1 : 1),
        y: Utils.generateFloat(0.3, 0.15) * (Math.sign(properties.position.y) === 1 ? -1 : 1)
      }
      properties.mass          = mass
      properties.radius        = radius
      properties.label         = {
        type: "newborn",
        remainingFrames: 3 * updateFrequency
      }

      planet                   = this.generatePlanet(planets, w, h, properties)
    }

    return planet
  },

  getInitialState: function(canvasWidth, canvasHeight, numInitialPlanets) {
    const initialPlanets = this.generatePlanets(canvasWidth, canvasHeight, numInitialPlanets)
    const initialState   = {
      planets      : initialPlanets,
      velocities   :{},
      accelerations: {},
      eyeCandy     : []
    }
    
    return initialState
  },

  updateMovement: function(planets, G, w, h) {
    const accelerations     = this.getUpdatedAccelerations(planets, G)
    const velocities        = this.getUpdatedVelocities(planets, accelerations)
    const updatedKinematics = this.updateKinematics(planets, velocities, accelerations)

    const positionedPlanets = this.positionPlanets(updatedKinematics, w, h)

    return positionedPlanets
  },

  handleInteractions: function(planets, w, h, eyeCandy, updateFrequency) {
    const [collisions, intersections]         = this.getCollisions(planets)
    const labeledPlanets                      = this.labelPlanets(planets, collisions, w, h)
    const [mergedPlanets, additionalEyeCandy] = this.mergePlanets(labeledPlanets, intersections, updateFrequency)

    const updatedEyeCandy                     = this.updateEyeCandy(eyeCandy, additionalEyeCandy)

    return [mergedPlanets, updatedEyeCandy, intersections]
  },

  getNextState: function(state, canvasWidth, canvasHeight, variables) {
    const structuredPlanets                            = this.updateStructure(state.planets)
    const movedPlanets                                 = this.updateMovement(structuredPlanets, variables.G, canvasWidth, canvasHeight)
    const [interactedPlanets, eyeCandy, intersections] = this.handleInteractions(movedPlanets, canvasWidth, canvasHeight, state.eyeCandy, variables.updateFrequency)

    const possibleNewPlanet                            = this.possiblyCreateNewPlanet(interactedPlanets, canvasWidth, canvasHeight, variables.newPlanetFrequency, variables.updateFrequency)
    const planets                                      = possibleNewPlanet ? [...interactedPlanets, possibleNewPlanet] : interactedPlanets

    return {planets, intersections, eyeCandy}
  }
}

export default Gravity