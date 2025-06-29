import React from 'react';
import './OptionsQuoteEditor.css';

// --- 型別定義 (可以抽離到共用檔案) ---
interface BidAskPrices {
  bid: number;
  ask: number;
}
interface CallPutQuote {
  call: BidAskPrices;
  put: BidAskPrices;
}
export interface QuoteRow extends CallPutQuote {
  id: number;
  strike: number;
}

// --- 定義元件的 props 型別 ---
interface OptionsQuoteEditorProps {
  quotes: QuoteRow[];
  onQuotesChange: (newQuotes: QuoteRow[]) => void;
}

const OptionsQuoteEditor: React.FC<OptionsQuoteEditorProps> = ({ quotes, onQuotesChange }) => {
  // 內部不再有自己的 useState

  const handleInputChange = (id: number, field: string, value: string) => {
    const numericValue = parseFloat(value) || 0;
    const updatedQuotes = quotes.map(quote => {
      if (quote.id === id) {
        const updatedQuote = { ...quote, call: { ...quote.call }, put: { ...quote.put } };
        const keys = field.split('.');
        if (keys.length === 1) {
          (updatedQuote as any)[keys[0]] = numericValue;
        } else if (keys.length === 2) {
          const [level1, level2] = keys as ['call' | 'put', 'bid' | 'ask'];
          updatedQuote[level1][level2] = numericValue;
        }
        return updatedQuote;
      }
      return quote;
    });
    // 呼叫從 props 傳入的函式，將更新通知給父元件
    onQuotesChange(updatedQuotes);
  };

  const handleAddRow = () => {
    const newId = quotes.length > 0 ? Math.max(...quotes.map(q => q.id)) + 1 : 1;
    const newRow: QuoteRow = {
      id: newId,
      strike: 0,
      call: { bid: 0, ask: 0 },
      put: { bid: 0, ask: 0 },
    };
    // 通知父元件新增一列
    onQuotesChange([...quotes, newRow]);
  };

  const handleDeleteRow = (id: number) => {
    const updatedQuotes = quotes.filter(quote => quote.id !== id);
    // 通知父元件刪除一列
    onQuotesChange(updatedQuotes);
  };

  return (
    <div className="quote-editor-container">
      <table className="quote-table">
        <thead>
          <tr>
            <th>履約價</th>
            <th>買權 買入</th>
            <th>買權 賣出</th>
            <th>賣權 買入</th>
            <th>賣權 賣出</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {quotes.map((quote) => (
            <tr key={quote.id}>
              <td>
                <input
                  type="number"
                  value={quote.strike}
                  onChange={(e) => handleInputChange(quote.id, 'strike', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={quote.call.bid}
                  onChange={(e) => handleInputChange(quote.id, 'call.bid', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={quote.call.ask}
                  onChange={(e) => handleInputChange(quote.id, 'call.ask', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={quote.put.bid}
                  onChange={(e) => handleInputChange(quote.id, 'put.bid', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={quote.put.ask}
                  onChange={(e) => handleInputChange(quote.id, 'put.ask', e.target.value)}
                />
              </td>
              <td>
                <button className="delete-btn" onClick={() => handleDeleteRow(quote.id)}>
                  刪除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="add-btn" onClick={handleAddRow}>
        ＋ 新增履約價
      </button>
    </div>
  );
};

export default OptionsQuoteEditor;