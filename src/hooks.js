import { useState, useEffect, useRef } from 'react';

export function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

  function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
      width,
      height
    };
  }

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowDimensions;
}

export function useInterval(callback, delay) {
  const savedCallback = useRef();
  const [activeTimeoutExists, setActiveTimeoutExists] = useState(false)
  const [_timeout, _setTimeout] = useState(null)

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      if (activeTimeoutExists) {
        _setTimeout(clearTimeout(_timeout))
      }
      setActiveTimeoutExists(true)
      let interval

      _setTimeout(setTimeout(() => {
        setActiveTimeoutExists(false)
        interval = setInterval(tick, delay);
      }, delay))
      
      return () => clearInterval(interval);
    }
  }, [delay]);
}