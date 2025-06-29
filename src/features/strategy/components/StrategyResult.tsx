interface StrategyResultProps {
  result: {
    cost?: number;
    credit?: number;
    maxRisk: number;
    maxProfit: number;
    breakevens?: number[];
    breakeven?: number;
  };
}

export default function StrategyResult({ result }: StrategyResultProps) {
  const {
    cost,
    credit,
    maxRisk,
    maxProfit,
    breakevens,
    breakeven,
  } = result;

  // 整理損益平衡點
  const bePoints = breakevens ?? (breakeven !== undefined ? [breakeven] : []);

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', fontFamily: 'sans-serif' }}>
      <h2 style={{ marginBottom: '12px', fontSize: '18px', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>策略結果</h2>

      {/* 成本／權利金 */}
      {(cost !== undefined || credit !== undefined) && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '14px', color: '#64748b' }}>{cost !== undefined ? '淨成本' : '淨權利金'}</div>
          <div style={{ fontSize: '16px', fontWeight: '600' }}>{cost ?? credit} 點</div>
        </div>
      )}

      {/* 最大風險 */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '14px', color: '#64748b' }}>最大風險</div>
        <div style={{ fontSize: '16px', fontWeight: '600' }}>{maxRisk} 點</div>
      </div>

      {/* 最大獲利 */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '14px', color: '#64748b' }}>最大獲利</div>
        <div style={{ fontSize: '16px', fontWeight: '600' }}>
          {maxProfit === Infinity ? '無上限' : `${maxProfit} 點`}
        </div>
      </div>

      {/* 損益平衡點 */}
      {bePoints.length > 0 && (
        <div>
          <div style={{ fontSize: '14px', color: '#64748b' }}>損益平衡點</div>
          <div style={{ fontSize: '16px', fontWeight: '600' }}>
            {bePoints.join(' / ')}
          </div>
        </div>
      )}
    </div>
  );
}
