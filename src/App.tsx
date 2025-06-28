import { useEffect, useState, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

const FINDMINDTRADE_API = '/finMind'
const TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkYXRlIjoiMjAyNS0wNi0yOCAxNTozNjoyOSIsInVzZXJfaWQiOiJtaW5nbW90aCIsImlwIjoiMS4xNjguMzcuMjcifQ.fa4pCaA0FgFyGEWr09LyLxKzXXAcyzIg45Xp5DNuN9M'
const DATA_SET = 'TaiwanFutOptTickInfo'
// const DATA_ID = 'TX220400G5'



function App() {
  const [count, setCount] = useState(0)
  const isInit = useRef(false)

  async function getOptionAPI() {
    try {
    const response = await fetch(`${FINDMINDTRADE_API}?dataset=${DATA_SET}`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}` // 請將 YOUR_TOKEN_HERE 替換成您的 Token
      }
    });
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('API 請求失敗:', error);
  }
  }

  useEffect(() => {
    if(isInit.current) return
    getOptionAPI()
    isInit.current = true
  }, [])


  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
