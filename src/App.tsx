import { useState } from 'react';
import OptionsQuoteEditor from './features/strategy/OptionsQuoteEditor.tsx';
import { OptionStrategyCalculator } from './features/strategy/index.ts'; 
import StrategyResult from './features/strategy/components/StrategyResult.tsx';

import type { QuoteRow } from './features/strategy/OptionsQuoteEditor.tsx';
import type { Quotes } from './features/strategy/index.ts'; 
import './App.css';

// --- 初始範例資料 (現在由父元件管理) ---
const initialQuotesData: QuoteRow[] = [
  { id: 1, strike: 22000, call: { bid: 122, ask: 143 }, put: { bid: 40, ask: 58 } },
  { id: 2, strike: 22100, call: { bid: 96, ask: 137 }, put: { bid: 31, ask: 59 } },
  { id: 3, strike: 22200, call: { bid: 75, ask: 98 }, put: { bid: 28, ask: 78 } },
  { id: 4, strike: 22300, call: { bid: 40, ask: 52.5 }, put: { bid: 96, ask: 137 } },
  { id: 5, strike: 22400, call: { bid: 20.5, ask: 22.5 }, put: { bid: 235, ask: 255 } },
  { id: 6, strike: 22500, call: { bid: 9, ask: 11 }, put: { bid: 320, ask: 340 } },
];

/**
 * 一個輔助函式，將 React state 的陣列格式轉換為計算器需要的物件格式
 */
const convertToCalculatorFormat = (rows: QuoteRow[]): Quotes => {
  const quotesObj: Quotes = {};
  for (const row of rows) {
    if (row.strike > 0) {
      quotesObj[row.strike] = {
        call: row.call,
        put: row.put,
      };
    }
  }
  return quotesObj;
};

type StrategyInputTypes = 'straddle' | 'strangle' | 'bullCall' | 'bearPut' | 'ironCondor' | 'butterfly'

interface StrategyInputs {
  straddle: string;
  strangle: { k1: string; k2: string };
  bullCall: { low: string; high: string };
  bearPut: { high: string; low: string };
  ironCondor: { kp1: string; kp2: string; kc1: string; kc2: string };
  butterfly: { low: string; mid: string; high: string };
}



function App() {
  // --- State ---
  const [quotes, setQuotes] = useState<QuoteRow[]>(initialQuotesData);

  // 狀態來儲存每個策略的輸入履約價
  const [strategyInputs, setStrategyInputs] = useState({
    straddle: '22200',
    strangle: { k1: '22100', k2: '22300' },
    bullCall: { low: '22200', high: '22400' },
    bearPut: { high: '22200', low: '22000' },
    ironCondor: { kp1: '22000', kp2: '22100', kc1: '22300', kc2: '22400' },
    butterfly: { low: '22100', mid: '22200', high: '22300' },
  });

  // 狀態來儲存每個策略的計算結果
  const [results, setResults] = useState<Record<string, any>>({});

  // --- Handlers ---
  const handleQuotesChange = (updatedQuotes: QuoteRow[]) => {
    setQuotes(updatedQuotes);
  };
  
  const handleInputChange = (strategy: StrategyInputTypes, field: string, value: string) => {
    setStrategyInputs((prev: StrategyInputs) => ({
        ...prev,
        [strategy]: typeof prev[strategy] === 'string' 
            ? value 
            : { ...prev[strategy], [field]: value }
    }));
  };

  const runCalculation = (strategyName: string, calculationFn: () => any) => {
      try {
          const result = calculationFn();
          setResults(prev => ({ ...prev, [strategyName]: result }));
      } catch (error) {
          if (error instanceof TypeError) {
              alert("計算錯誤：請檢查履約價是否存在於報價表格中，且所有欄位都已填寫。");
          } else {
              alert(`發生未知錯誤: ${error}`);
          }
          console.error("Calculation Error:", error);
      }
  };

  return (
    <div className="App">
      <main>
        <OptionsQuoteEditor quotes={quotes} onQuotesChange={handleQuotesChange} />
        
        <div className="calculations-container">
          {/* --- Straddle --- */}
          <div className="calculation-card">
            <h3>買權跨式 (Long Straddle)</h3>
            <div className="input-group condensed">
              <label>履約價 (K):</label>
              <input type="number" value={strategyInputs.straddle} onChange={e => handleInputChange('straddle', '', e.target.value)} />
            </div>
            <button onClick={() => runCalculation('straddle', () => {
                const K = parseInt(strategyInputs.straddle);
                return OptionStrategyCalculator.straddle(K, convertToCalculatorFormat(quotes));
            })}>計算</button>
            {results.straddle && <StrategyResult result={results.straddle} />}
          </div>

          {/* --- Strangle --- */}
          <div className="calculation-card">
            <h3>買權勒式 (Long Strangle)</h3>
            <div className="input-group condensed">
              <label>Put 履約價 (K1):</label>
              <input type="number" value={strategyInputs.strangle.k1} onChange={e => handleInputChange('strangle', 'k1', e.target.value)} />
              <label>Call 履約價 (K2):</label>
              <input type="number" value={strategyInputs.strangle.k2} onChange={e => handleInputChange('strangle', 'k2', e.target.value)} />
            </div>
            <button onClick={() => runCalculation('strangle', () => {
                const { k1, k2 } = strategyInputs.strangle;
                return OptionStrategyCalculator.strangle(parseInt(k1), parseInt(k2), convertToCalculatorFormat(quotes));
            })}>計算</button>
            {results.strangle && <StrategyResult result={results.strangle} />}
          </div>
          
          {/* --- Bull Call Spread --- */}
          <div className="calculation-card">
            <h3>牛市買權價差 (Bull Call)</h3>
            <div className="input-group condensed">
              <label>買入履約價 (Low):</label>
              <input type="number" value={strategyInputs.bullCall.low} onChange={e => handleInputChange('bullCall', 'low', e.target.value)} />
              <label>賣出履約價 (High):</label>
              <input type="number" value={strategyInputs.bullCall.high} onChange={e => handleInputChange('bullCall', 'high', e.target.value)} />
            </div>
            <button onClick={() => runCalculation('bullCall', () => {
                const { low, high } = strategyInputs.bullCall;
                return OptionStrategyCalculator.bullCallSpread(parseInt(low), parseInt(high), convertToCalculatorFormat(quotes));
            })}>計算</button>
            {results.bullCall && <StrategyResult result={results.bullCall} />}
          </div>
          
          {/* --- Bear Put Spread --- */}
          <div className="calculation-card">
            <h3>熊市賣權價差 (Bear Put)</h3>
            <div className="input-group condensed">
              <label>買入履約價 (High):</label>
              <input type="number" value={strategyInputs.bearPut.high} onChange={e => handleInputChange('bearPut', 'high', e.target.value)} />
              <label>賣出履約價 (Low):</label>
              <input type="number" value={strategyInputs.bearPut.low} onChange={e => handleInputChange('bearPut', 'low', e.target.value)} />
            </div>
            <button onClick={() => runCalculation('bearPut', () => {
                const { high, low } = strategyInputs.bearPut;
                return OptionStrategyCalculator.bearPutSpread(parseInt(high), parseInt(low), convertToCalculatorFormat(quotes));
            })}>計算</button>
            {results.bearPut && <StrategyResult result={results.bearPut} />}
          </div>
          
          {/* --- Iron Condor --- */}
          <div className="calculation-card">
            <h3>鐵兀鷹 (Iron Condor)</h3>
            <div className="input-group condensed">
              <label>買 Put (Kp1):</label><input type="number" value={strategyInputs.ironCondor.kp1} onChange={e => handleInputChange('ironCondor', 'kp1', e.target.value)} />
              <label>賣 Put (Kp2):</label><input type="number" value={strategyInputs.ironCondor.kp2} onChange={e => handleInputChange('ironCondor', 'kp2', e.target.value)} />
              <label>賣 Call (Kc1):</label><input type="number" value={strategyInputs.ironCondor.kc1} onChange={e => handleInputChange('ironCondor', 'kc1', e.target.value)} />
              <label>買 Call (Kc2):</label><input type="number" value={strategyInputs.ironCondor.kc2} onChange={e => handleInputChange('ironCondor', 'kc2', e.target.value)} />
            </div>
            <button onClick={() => runCalculation('ironCondor', () => {
                const { kp1, kp2, kc1, kc2 } = strategyInputs.ironCondor;
                return OptionStrategyCalculator.ironCondor(parseInt(kp1), parseInt(kp2), parseInt(kc1), parseInt(kc2), convertToCalculatorFormat(quotes));
            })}>計算</button>
            {results.ironCondor && <StrategyResult result={results.ironCondor} />}
          </div>

          {/* --- Butterfly --- */}
          <div className="calculation-card">
            <h3>蝶式 (Butterfly)</h3>
            <div className="input-group condensed">
              <label>低履約 (KL):</label><input type="number" value={strategyInputs.butterfly.low} onChange={e => handleInputChange('butterfly', 'low', e.target.value)} />
              <label>中樞 (KM):</label><input type="number" value={strategyInputs.butterfly.mid} onChange={e => handleInputChange('butterfly', 'mid', e.target.value)} />
              <label>高履約 (KH):</label><input type="number" value={strategyInputs.butterfly.high} onChange={e => handleInputChange('butterfly', 'high', e.target.value)} />
            </div>
            <button onClick={() => runCalculation('butterfly', () => {
                const { low, mid, high } = strategyInputs.butterfly;
                return OptionStrategyCalculator.butterfly(parseInt(low), parseInt(mid), parseInt(high), convertToCalculatorFormat(quotes));
            })}>計算</button>
            {results.butterfly && <StrategyResult result={results.butterfly} />}
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;