import { useEffect, useRef, useState } from 'react'
import { useWindowDimensions, useInterval } from './hooks.js'
import './cssReset.css'
import Gravity from './Gravity.js'
import Draw from './Draw.js'
import Utils from './Utils.js'
import styled from 'styled-components'
import Geometry2D from './Geometry2D.js'

const StyledButton = styled.button`
  position: relative;
  top: ${props => props.styles.top}px;
  left: 10px;
  padding: 10px 10px;
  margin-right: 10px;
  outline: none;
  border: none;
  cursor: pointer;
  background-color: #9bb2c2;
  opacity: 0.8;
  color: "#23333d";
  z-index: 2;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    opacity: 1;
  }
`;

function App() {
  const { height, width }                                         = useWindowDimensions()
  const [updateFrequency, setUpdateFrequency]                     = useState(5)
  const canvasRef                                                 = useRef(null)
  const [isCreatingNewPlanet, setIsCreatingNewPlanet]             = useState(false)
  const [numStartingPlanets, setNumStartingPlanets]               = useState(2)
  const [newPlanet, setNewPlanet]                                 = useState({})
  const [showInformationBar, setShowInformationBar]               = useState(true)
  const [chanceOfCreatingNewPlanet, setChanceOfCreatingNewPlanet] = useState(0.05)
  const [state, setState]                                         = useState({
    planets: [
      {position: {x:400, y:400}, mass:2000, radius:Gravity.getPlanetRadius(2000), velocity: {x:0, y:0}, id: "abcd", label: {label: "planet"}, color: Utils.generateColor()},
      {position: {x:1600, y:900}, mass:100, radius:Gravity.getPlanetRadius(100), velocity: {x:0, y:0}, id: "bcde", label: {label: "planet"}, color: Utils.generateColor()},
    ],
    accelerations: {},
    velocities: {},
    eyeCandy: []
  })

  const onCanvasMouseDown = event => {
    setIsCreatingNewPlanet(true)
    setNewPlanet({position: {x: event.clientX, y: event.clientY}, velocity: {x:0,y:0}, mass: 100, radius: Gravity.getPlanetRadius(100), id: "1234", color: Utils.generateColor(0.5), label: {label: "planet"}})
  }

  const onCanvasMouseUp = event => {
    if (isCreatingNewPlanet) {
      const planet = {
        ...newPlanet,
        velocity: {x: 0.2 * (event.clientX >= newPlanet.x ? 1 : -1), y: 0.2 * (event.clientY >= newPlanet.y ? 1 : -1)},
        label: {label: "newborn", remainingFrames: 2 * updateFrequency},
      }

      setState(state => ({...state, planets: [...state.planets, planet]}))
    }

    setIsCreatingNewPlanet(false)
  }

  const onCanvasMouseMove = event => {
    if (isCreatingNewPlanet) {
      const updatedPlanet = {
        ...newPlanet,
        position: {
          x: event.clientX,
          y:  event.clientY
        }
      }

      setNewPlanet(updatedPlanet)
    }
  }

  const chanceToMakeNewPlanet = function(planets) {
    let planet = []
    const outcome = Math.random()

    if (outcome > (1 - (((numStartingPlanets + 1 - planets.length) * chanceOfCreatingNewPlanet)/50))) {
      const mass = Utils.generateInt(500, 120)
      const radius = Gravity.getPlanetRadius(mass)

      const xInside = (Math.random() > 0.5 ? true : false)
      const yInside = !xInside

      const properties = {}
      properties.position = {
        x: (xInside ? Utils.generateInt(width  - radius, radius) : (Math.random() > 0.5 ? width + radius : -radius)),
        y: (yInside ? Utils.generateInt(height - radius, radius) : (Math.random() > 0.5 ? height + radius : -radius)),
      }
      properties.velocity = {
        x: Utils.generateFloat(0.3, 0.15) * (Math.sign(properties.position.x) === 1 ? -1 : 1),
        y: Utils.generateFloat(0.3, 0.15) * (Math.sign(properties.position.y) === 1 ? -1 : 1)
      }
      properties.mass = mass
      properties.radius = radius
      properties.label = {
        label: "newborn",
        remainingFrames: 3 * updateFrequency
      }

      const planet = Gravity.generatePlanet(planets, width, height, properties)

      planets.push(planet)
    }

    return planet
  }

  const init = function() {
    //const initialPlanets = Gravity.generatePlanets(width, height, numStartingPlanets)
    //setState({planets: initialPlanets, velocities: {}, accelerations: {}, eyeCandy: []})
  }

  // effects

  useEffect(() => {
    init()
  }, [])


  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    canvas.onmousedown = onCanvasMouseDown
    canvas.onmouseup   = onCanvasMouseUp
    canvas.onmousemove = onCanvasMouseMove

    if (isCreatingNewPlanet) {
      Draw.fillCanvas(context, state, width, height, showInformationBar, newPlanet)
    } else {
      Draw.fillCanvas(context, state, width, height, showInformationBar, false)
    }
  }, [state, Draw.fillCanvas, showInformationBar])

  useInterval(() => {
    const nextState = Gravity.getNextState(state, width, height, updateFrequency)
    const maybeAPlanet = chanceToMakeNewPlanet(nextState.planets)

    nextState.planets = nextState.planets.concat(maybeAPlanet)

    if (nextState.planets.length === 3) {
      let b
      let s

      for (let planet of nextState.planets) {
        if (planet.id === "abcd") {
          b = planet
        }

        if (planet.id === "1234") {
          s = planet
        }
      }


      console.log(Geometry2D.doCirclesIntersect(b.position,s.position, b.radius,s.radius))
    } 

    setState(nextState)
    
    if (isCreatingNewPlanet) setNewPlanet(newPlanet => ({...newPlanet, mass: newPlanet.mass + (250/updateFrequency), radius: Gravity.getPlanetRadius(newPlanet.mass + (250/updateFrequency))}))
    
  }, Math.floor(1000/updateFrequency))

  return (
    <div className="App">
      <canvas ref={canvasRef} width={width} height={height} />
      <StyledButton styles={{top: height - 45}} onClick={() => init()}>{"Refresh"}</StyledButton>
      <StyledButton styles={{top: height - 45}} onClick={() => setShowInformationBar(!showInformationBar)}>{`${showInformationBar ? "Hide" : "Show"} information`}</StyledButton>
    </div>
  )
}

export default App
