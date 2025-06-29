import { useState, useCallback, useRef, useEffect } from "react";
import { debounce } from "./utils";

import OptionsQuoteEditor from "./features/strategy/OptionsQuoteEditor.tsx";
import { OptionStrategyCalculator } from "./features/strategy/index.ts";
import StrategyResult from "./features/strategy/components/StrategyResult.tsx";

import type { QuoteRow } from "./features/strategy/OptionsQuoteEditor.tsx";
import type { Quotes } from "./features/strategy/index.ts";
import "./App.css";

const initialQuotesData: QuoteRow[] = [
  {
    id: -1,
    strike: 22200,
    call: { bid: 372, ask: 388 },
    put: { bid: 454, ask: 550 },
  },
  {
    id: 1,
    strike: 22300,
    call: { bid: 296, ask: 328 },
    put: { bid: 444, ask: 575 },
  },
  {
    id: 2,
    strike: 22400,
    call: { bid: 254, ask: 292 },
    put: { bid: 530, ask: 595 },
  },
  {
    id: 3,
    strike: 22500,
    call: { bid: 227, ask: 252 },
    put: { bid: 595, ask: 640 },
  },
  {
    id: 4,
    strike: 22600,
    call: { bid: 205, ask: 219 },
    put: { bid: 640, ask: 705 },
  },
  {
    id: 5,
    strike: 22700,
    call: { bid: 170, ask: 180 },
    put: { bid: 740, ask: 845 },
  },
  {
    id: 6,
    strike: 22800,
    call: { bid: 132, ask: 155 },
    put: { bid: 810, ask: 865 },
  },
];

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

type StrategyInputTypes =
  | "straddle"
  | "strangle"
  | "bullCall"
  | "bearPut"
  | "ironCondor"
  | "butterfly";

interface StrategyInputs {
  straddle: string;
  strangle: { k1: string; k2: string };
  bullCall: { low: string; high: string };
  bearPut: { high: string; low: string };
  ironCondor: { kp1: string; kp2: string; kc1: string; kc2: string };
  butterfly: { low: string; mid: string; high: string };
}

function App() {
  const [quotes, setQuotes] = useState<QuoteRow[]>(initialQuotesData);
  const [strategyInputs, setStrategyInputs] = useState<StrategyInputs>({
    straddle: "22500",
    strangle: { k1: "22300", k2: "22700" },
    bullCall: { low: "22500", high: "22700" },
    bearPut: { high: "22500", low: "22300" },
    ironCondor: { kp1: "22300", kp2: "22400", kc1: "22600", kc2: "22700" },
    butterfly: { low: "22300", mid: "22500", high: "22700" },
  });
  const [results, setResults] = useState<Record<string, any>>({});

  // --- debounce 計算 ---
  // 只生成一次 debounce instance
  const debouncedRunAllCalculations = useRef(
    debounce((q: QuoteRow[], s: StrategyInputs) => {
      const quotesFormatted = convertToCalculatorFormat(q);
      const newResults: Record<string, any> = {};

      try {
        newResults.straddle = OptionStrategyCalculator.straddle(
          parseInt(s.straddle),
          quotesFormatted
        );
      } catch (error: any) {
        newResults.straddle = { error: error.message || String(error) };
      }
      try {
        const { k1, k2 } = s.strangle;
        newResults.strangle = OptionStrategyCalculator.strangle(
          parseInt(k1),
          parseInt(k2),
          quotesFormatted
        );
      } catch (error: any) {
        newResults.strangle = { error: error.message || String(error) };
      }
      try {
        const { low, high } = s.bullCall;
        newResults.bullCall = OptionStrategyCalculator.bullCallSpread(
          parseInt(low),
          parseInt(high),
          quotesFormatted
        );
      } catch (error: any) {
        newResults.bullCall = { error: error.message || String(error) };
      }
      try {
        const { high, low } = s.bearPut;
        newResults.bearPut = OptionStrategyCalculator.bearPutSpread(
          parseInt(high),
          parseInt(low),
          quotesFormatted
        );
      } catch (error: any) {
        newResults.bearPut = { error: error.message || String(error) };
      }
      try {
        const { kp1, kp2, kc1, kc2 } = s.ironCondor;
        newResults.ironCondor = OptionStrategyCalculator.ironCondor(
          parseInt(kp1),
          parseInt(kp2),
          parseInt(kc1),
          parseInt(kc2),
          quotesFormatted
        );
      } catch (error: any) {
        newResults.ironCondor = { error: error.message || String(error) };
      }
      try {
        const { low, mid, high } = s.butterfly;
        newResults.butterfly = OptionStrategyCalculator.butterfly(
          parseInt(low),
          parseInt(mid),
          parseInt(high),
          quotesFormatted
        );
      } catch (error: any) {
        newResults.butterfly = { error: error.message || String(error) };
      }
      setResults(newResults);
    }, 500) // 500ms debounce
  ).current;

  // 每次 quotes 或 strategyInputs 變動時自動計算
  useEffect(() => {
    debouncedRunAllCalculations(quotes, strategyInputs);
    // eslint-disable-next-line
  }, [quotes, strategyInputs]);

  const handleQuotesChange = (updatedQuotes: QuoteRow[]) => {
    setQuotes(updatedQuotes);
  };

  const handleInputChange = (
    strategy: StrategyInputTypes,
    field: string,
    value: string
  ) => {
    setStrategyInputs((prev: StrategyInputs) => ({
      ...prev,
      [strategy]:
        typeof prev[strategy] === "string"
          ? value
          : { ...prev[strategy], [field]: value },
    }));
  };

  // 「手動一鍵計算」：立即計算，不 debounce
  const runAllCalculations = useCallback(() => {
    const quotesFormatted = convertToCalculatorFormat(quotes);
    const newResults: Record<string, any> = {};

    try {
      newResults.straddle = OptionStrategyCalculator.straddle(
        parseInt(strategyInputs.straddle),
        quotesFormatted
      );
    } catch (error: any) {
      newResults.straddle = { error: error.message || String(error) };
    }
    try {
      const { k1, k2 } = strategyInputs.strangle;
      newResults.strangle = OptionStrategyCalculator.strangle(
        parseInt(k1),
        parseInt(k2),
        quotesFormatted
      );
    } catch (error: any) {
      newResults.strangle = { error: error.message || String(error) };
    }
    try {
      const { low, high } = strategyInputs.bullCall;
      newResults.bullCall = OptionStrategyCalculator.bullCallSpread(
        parseInt(low),
        parseInt(high),
        quotesFormatted
      );
    } catch (error: any) {
      newResults.bullCall = { error: error.message || String(error) };
    }
    try {
      const { high, low } = strategyInputs.bearPut;
      newResults.bearPut = OptionStrategyCalculator.bearPutSpread(
        parseInt(high),
        parseInt(low),
        quotesFormatted
      );
    } catch (error: any) {
      newResults.bearPut = { error: error.message || String(error) };
    }
    try {
      const { kp1, kp2, kc1, kc2 } = strategyInputs.ironCondor;
      newResults.ironCondor = OptionStrategyCalculator.ironCondor(
        parseInt(kp1),
        parseInt(kp2),
        parseInt(kc1),
        parseInt(kc2),
        quotesFormatted
      );
    } catch (error: any) {
      newResults.ironCondor = { error: error.message || String(error) };
    }
    try {
      const { low, mid, high } = strategyInputs.butterfly;
      newResults.butterfly = OptionStrategyCalculator.butterfly(
        parseInt(low),
        parseInt(mid),
        parseInt(high),
        quotesFormatted
      );
    } catch (error: any) {
      newResults.butterfly = { error: error.message || String(error) };
    }
    setResults(newResults);
  }, [quotes, strategyInputs]);

  return (
    <div className="App">
      <main>
        <OptionsQuoteEditor
          quotes={quotes}
          onQuotesChange={handleQuotesChange}
        />
        <div>
          <div style={{ textAlign: "center", marginBottom: 8 }}>
            <button
              onClick={runAllCalculations}
              style={{ fontSize: 18, padding: "8px 24px" }}
            >
              一鍵計算全部策略
            </button>
            <span style={{ fontSize: 12, color: "#999", marginTop: 4 }}>
              （input 欄位/表格資料有變動時會自動運算）
            </span>
          </div>
          <div className="calculations-container">
            {/* --- Straddle --- */}
            <div className="calculation-card">
              <div className="calculation-card-header">
                <h3>買權跨式 (Long Straddle)</h3>
              </div>
              <div className="input-group condensed">
                <label>履約價 (K):</label>
                <input
                  type="number"
                  step={100}
                  value={strategyInputs.straddle}
                  onChange={(e) =>
                    handleInputChange("straddle", "", e.target.value)
                  }
                />
              </div>
              {results.straddle?.error ? (
                <div style={{ color: "red" }}>{results.straddle.error}</div>
              ) : (
                results.straddle && <StrategyResult result={results.straddle} />
              )}
            </div>

            {/* --- Strangle --- */}
            <div className="calculation-card">
              <div className="calculation-card-header">
                <h3>買權勒式 (Long Strangle)</h3>
              </div>
              <div className="input-group condensed">
                <label>Put 履約價 (K1):</label>
                <input
                  type="number"
                  step={100}
                  value={strategyInputs.strangle.k1}
                  onChange={(e) =>
                    handleInputChange("strangle", "k1", e.target.value)
                  }
                />
                <label>Call 履約價 (K2):</label>
                <input
                  type="number"
                  step={100}
                  value={strategyInputs.strangle.k2}
                  onChange={(e) =>
                    handleInputChange("strangle", "k2", e.target.value)
                  }
                />
              </div>
              {results.strangle?.error ? (
                <div style={{ color: "red" }}>{results.strangle.error}</div>
              ) : (
                results.strangle && <StrategyResult result={results.strangle} />
              )}
            </div>

            {/* --- Bull Call Spread --- */}
            <div className="calculation-card">
              <div className="calculation-card-header">
                <h3>牛市買權價差 (Bull Call)</h3>
              </div>
              <div className="input-group condensed">
                <label>買入履約價 (Low):</label>
                <input
                  type="number"
                  step={100}
                  value={strategyInputs.bullCall.low}
                  onChange={(e) =>
                    handleInputChange("bullCall", "low", e.target.value)
                  }
                />
                <label>賣出履約價 (High):</label>
                <input
                  type="number"
                  step={100}
                  value={strategyInputs.bullCall.high}
                  onChange={(e) =>
                    handleInputChange("bullCall", "high", e.target.value)
                  }
                />
              </div>
              {results.bullCall?.error ? (
                <div style={{ color: "red" }}>{results.bullCall.error}</div>
              ) : (
                results.bullCall && <StrategyResult result={results.bullCall} />
              )}
            </div>

            {/* --- Bear Put Spread --- */}
            <div className="calculation-card">
              <div className="calculation-card-header">
                <h3>熊市賣權價差 (Bear Put)</h3>
              </div>
              <div className="input-group condensed">
                <label>買入履約價 (High):</label>
                <input
                  type="number"
                  step={100}
                  value={strategyInputs.bearPut.high}
                  onChange={(e) =>
                    handleInputChange("bearPut", "high", e.target.value)
                  }
                />
                <label>賣出履約價 (Low):</label>
                <input
                  type="number"
                  step={100}
                  value={strategyInputs.bearPut.low}
                  onChange={(e) =>
                    handleInputChange("bearPut", "low", e.target.value)
                  }
                />
              </div>
              {results.bearPut?.error ? (
                <div style={{ color: "red" }}>{results.bearPut.error}</div>
              ) : (
                results.bearPut && <StrategyResult result={results.bearPut} />
              )}
            </div>

            {/* --- Iron Condor --- */}
            <div className="calculation-card">
              <div className="calculation-card-header">
                <h3>鐵兀鷹 (Iron Condor)</h3>
              </div>
              <div className="input-group condensed">
                <label>買 Put (Kp1):</label>
                <input
                  type="number"
                  value={strategyInputs.ironCondor.kp1}
                  onChange={(e) =>
                    handleInputChange("ironCondor", "kp1", e.target.value)
                  }
                />
                <label>賣 Put (Kp2):</label>
                <input
                  type="number"
                  value={strategyInputs.ironCondor.kp2}
                  onChange={(e) =>
                    handleInputChange("ironCondor", "kp2", e.target.value)
                  }
                />
                <label>賣 Call (Kc1):</label>
                <input
                  type="number"
                  value={strategyInputs.ironCondor.kc1}
                  onChange={(e) =>
                    handleInputChange("ironCondor", "kc1", e.target.value)
                  }
                />
                <label>買 Call (Kc2):</label>
                <input
                  type="number"
                  value={strategyInputs.ironCondor.kc2}
                  onChange={(e) =>
                    handleInputChange("ironCondor", "kc2", e.target.value)
                  }
                />
              </div>
              {results.ironCondor?.error ? (
                <div style={{ color: "red" }}>{results.ironCondor.error}</div>
              ) : (
                results.ironCondor && (
                  <StrategyResult result={results.ironCondor} />
                )
              )}
            </div>

            {/* --- Butterfly --- */}
            <div className="calculation-card">
              <div className="calculation-card-header">
                <h3>蝶式 (Butterfly)</h3>
              </div>
              <div className="input-group condensed">
                <label>買進 低履約 (KL):</label>
                <input
                  type="number"
                  value={strategyInputs.butterfly.low}
                  onChange={(e) =>
                    handleInputChange("butterfly", "low", e.target.value)
                  }
                />
                <label>賣出 中樞*2 (KM):</label>
                <input
                  type="number"
                  value={strategyInputs.butterfly.mid}
                  onChange={(e) =>
                    handleInputChange("butterfly", "mid", e.target.value)
                  }
                />
                <label>買進高履約 (KH):</label>
                <input
                  type="number"
                  value={strategyInputs.butterfly.high}
                  onChange={(e) =>
                    handleInputChange("butterfly", "high", e.target.value)
                  }
                />
              </div>
              {results.butterfly?.error ? (
                <div style={{ color: "red" }}>{results.butterfly.error}</div>
              ) : (
                results.butterfly && (
                  <StrategyResult result={results.butterfly} />
                )
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
