import { useEffect, useState, useRef } from "react";
import "./App.css";

function App() {
  const isInit = useRef(false);

  useEffect(() => {
    if (isInit.current) return;
    isInit.current = true;
  }, []);

  return (
    <>
      Options
    </>
  );
}

export default App;
