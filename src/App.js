import { useEffect, useRef, useState } from 'react'
import { useWindowDimensions, useInterval } from './hooks.js'
import './GlobalStyles.js'
import Gravity from './Gravity.js'
import Draw from './Draw.js'
import styled from 'styled-components'

const StyledApp = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;

  > canvas {
    position: absolute;
    z-index: 2000;
  }

  > div {
    position: absolute;
    z-index: 2100;
    bottom: 10px;
    left: 10px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 310px;

    > div.buttons {
      width: inherit;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      margin-top: 10px;
    }
  }
`;

const StyledButton = styled.button`
  padding: 10px 10px;
  outline: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #9bb2c2;
  opacity: 0.8;
  color: "#23333d";
  z-index: 2200;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    opacity: 1;
  }
`;

const StyledVariables = styled.div`
  z-index: 2200;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  background-color: #f5f5f5;
  border: 1px solid #9bb2c2;
  padding: 20px 10px 10px 20px;

  > div {
    display: flex;
    flex-direction: column;
    margin-bottom: 5px;

    > span {
      font-size: 12px;
      color: "#23333d";
      margin-bottom: 2px;
    }

    > input {
      width: 70px;
      padding: 8px 5px;
      margin-left: 2px;
      border: 1px solid #9bb2c2;
      border-radius: 4px;
      outline: none;
    }
  }
`;

function Variables({variables, setVariables}) {
  const variable2displayName = {
    "numInitialPlanets" : "Number of initial planets",
    "G"                 : "Gravitational constant",
    "updateFrequency"   : "Update frequency",
    "newPlanetFrequency": "Avg. new planet frequency"
  }

  const onInputChange = (event, variable) => {
    let newValue = parseFloat(event.target.value)

    if (!isNaN(newValue)) {
      if (variable === "numInitialPlanets") {
        newValue = Math.max(1, newValue)
      } else {
        newValue = Math.max(0, newValue)
      }

      setVariables(prev => ({
        ...prev,
        [variable]: newValue
      }))
    }
  }

  return (
    <StyledVariables>
      {
        Object.entries(variables).map(([variable, value]) => (
          <div>
            <span>{`${variable2displayName[variable]}:`}</span>
            <input onChange={(ev) => onInputChange(ev, variable)} defaultValue={value} />
          </div>
        ))
      }
    </StyledVariables>
  )
}

function App(props) {
  const { height, width }                             = useWindowDimensions()
  const canvasRef                                     = useRef(null)
  const [newPlanetInProgress, setNewPlanetInProgress] = useState(false)
  const [newPlanet, setNewPlanet]                     = useState({})
  const [showInformationBar, setShowInformationBar]   = useState(true)
  const [showVariables, setShowVariables]             = useState(false)
  const [variables, setVariables]                     = useState({
    numInitialPlanets : 10, 
    G                 : 6.67408 * Math.pow(10, -2), //true constant is 6.67408 * Math.pow(10, -11)
    updateFrequency   : 50,
    newPlanetFrequency: 0.1,
  })
  const [state, setState]                             = useState({
    planets: [],
    eyeCandy: []
  })

  const onCanvasMouseDown = event => {
    setNewPlanetInProgress(true)
    setNewPlanet(Gravity.generatePlanet(
      state.planets,
      width, 
      height,
      {
        position: {x: event.clientX, y: event.clientY},
        velocity: {x:0,y:0},
        mass: 100,
      }
    ))
  }

  const onCanvasMouseUp = _ => {
    if (newPlanetInProgress) {
      const planet = {
        ...newPlanet,
        velocity: {
          x: 0.2 * (Math.random() > 0.5 ? 1 : -1),
          y: 0.2 * (Math.random() > 0.5 ? 1 : -1)
        },
        label: {
          type: "newborn",
          remainingFrames: 2 * variables.updateFrequency
        },
      }

      setState(prevState => ({...prevState, planets: [...prevState.planets, planet]}))
    }

    setNewPlanetInProgress(false)
  }

  const onCanvasMouseMove = event => {
    if (newPlanetInProgress) {
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

  const init = function() {
    const initialPlanets = Gravity.generatePlanets(width, height, variables.numInitialPlanets)
    
    setState({planets: initialPlanets, eyeCandy: []})
  }

  useEffect(() => {
    const canvas       = canvasRef.current
    const context      = canvas.getContext('2d')

    canvas.onmousedown = onCanvasMouseDown
    canvas.onmouseup   = onCanvasMouseUp
    canvas.onmousemove = onCanvasMouseMove

    if (newPlanetInProgress) {
      Draw.fillCanvas(context, state, width, height, showInformationBar, newPlanet)
    } else {
      Draw.fillCanvas(context, state, width, height, showInformationBar, false)
    }
  }, [state, Draw.fillCanvas, showInformationBar])

  useEffect(() => {
    init()

    if (props.onLoaded) {
      props.onLoaded()
    }
  }, [])

  useEffect(() => {
    init()
  }, [variables.numInitialPlanets])

  useInterval(() => {
    const nextState = Gravity.getNextState(state, width, height, variables)
    setState(nextState)
    
    if (newPlanetInProgress) {
      setNewPlanet(planet => ({...planet, mass: planet.mass + (250/variables.updateFrequency), radius: Gravity.getPlanetRadius(planet.mass + (250/variables.updateFrequency))}))
    }
    
  }, Math.floor(1000/variables.updateFrequency))

  return (
    <StyledApp>
      <canvas ref={canvasRef} width={width} height={height} />

      <div>
        {
          showVariables &&
            <Variables variables={variables} setVariables={setVariables} />
        }
        <div className="buttons">
          <StyledButton onClick={() => init()}>{"Refresh"}</StyledButton>
          <StyledButton onClick={() => setShowInformationBar(!showInformationBar)}>{`${showInformationBar ? "Hide" : "Show"} information`}</StyledButton>
          <StyledButton onClick={() => setShowVariables(prev => !prev)}>{`${showVariables ? "Hide" : "Edit"} variables`}</StyledButton>
        </div>
      </div>
    </StyledApp>
  )
}

export default App
