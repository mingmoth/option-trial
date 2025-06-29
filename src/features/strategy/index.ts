interface BidAskPrices {
  bid: number;
  ask: number;
}

interface CallPutQuote {
  call: BidAskPrices
  put: BidAskPrices
}

interface Quotes {
  [key: number]: CallPutQuote
}

/**
 * OptionStrategyCalculator
 * 提供六種常見期權複式單計算：
 *  - Straddle, Strangle, BullCallSpread, BearPutSpread, IronCondor, Butterfly
 */
class OptionStrategyCalculator {
  /**
   * Long Straddle (買跨式)
   * @param {number} K ATM 履約價
   * @param {object} quotes
   * @returns {{cost: number, maxRisk: number, breakevens: number[]}}
   */
  static straddle(K: number, quotes: Quotes) {
    const callAsk = quotes[K].call.ask;
    const putAsk = quotes[K].put.ask;
    const cost = callAsk + putAsk;
    return {
      cost,
      maxRisk: cost,
      maxProfit: Infinity,
      breakevens: [K - cost, K + cost],
    };
  }

  /**
   * Long Strangle (買勒式)
   * @param {number} K1 下方 OTM Put 履約價
   * @param {number} K2 上方 OTM Call 履約價
   * @param {object} quotes
   * @returns {{cost: number, maxRisk: number, breakevens: number[]}}
   */
  static strangle(K1: number, K2: number, quotes) {
    const putAsk = quotes[K1].put.ask;
    const callAsk = quotes[K2].call.ask;
    const cost = putAsk + callAsk;
    return {
      cost,
      maxRisk: cost,
      maxProfit: Infinity,
      breakevens: [K1 - cost, K2 + cost],
    };
  }

  /**
   * Bull Call Spread (牛市價差)
   * @param {number} K_low  買進買權的履約價
   * @param {number} K_high 賣出買權的履約價
   * @param {object} quotes
   * @returns {{cost: number, maxRisk: number, maxProfit: number, breakeven: number}}
   */
  static bullCallSpread(K_low, K_high, quotes) {
    const buyAsk = quotes[K_low].call.ask;
    const sellBid = quotes[K_high].call.bid;
    const cost = buyAsk - sellBid;
    const width = K_high - K_low;
    return {
      cost,
      maxRisk: cost,
      maxProfit: width - cost,
      breakeven: K_low + cost,
    };
  }

  /**
   * Bear Put Spread (熊市價差)
   * @param {number} K_high 購入賣權的履約價
   * @param {number} K_low  賣出賣權的履約價
   * @param {object} quotes
   * @returns {{cost: number, maxRisk: number, maxProfit: number, breakeven: number}}
   */
  static bearPutSpread(K_high, K_low, quotes) {
    const buyAsk = quotes[K_high].put.ask;
    const sellBid = quotes[K_low].put.bid;
    const cost = buyAsk - sellBid;
    const width = K_high - K_low;
    return {
      cost,
      maxRisk: cost,
      maxProfit: width - cost,
      breakeven: K_high - cost,
    };
  }

  /**
   * Iron Condor (鐵隅)
   * @param {number} Kc1 賣出較低的 Call 履約價
   * @param {number} Kc2 買入較高的 Call 履約價
   * @param {number} Kp2 賣出較高的 Put 履約價
   * @param {number} Kp1 買入較低的 Put 履約價
   * @param {object} quotes
   * @returns {{credit: number, maxRisk: number, maxProfit: number}}
   */
  static ironCondor(Kc1, Kc2, Kp2, Kp1, quotes) {
    // Call 端：賣 Kc1、買 Kc2
    const callCredit = quotes[Kc1].call.bid - quotes[Kc2].call.ask;
    // Put  端：賣 Kp2、買 Kp1
    const putCredit = quotes[Kp2].put.bid - quotes[Kp1].put.ask;
    const totalCredit = callCredit + putCredit;
    // 風險 = 任一端寬度 - 該端 credit，以最壞端計
    const riskCall = Kc2 - Kc1 - callCredit;
    const riskPut = Kp2 - Kp1 - putCredit;
    return {
      maxProfit: totalCredit,
      maxRisk: Math.max(riskCall, riskPut),
    };
  }

  /**
   * Butterfly (蝶式)
   * @param {number} KL 低履約價
   * @param {number} KM 中樞履約價（賣出兩張）
   * @param {number} KH 高履約價
   * @param {object} quotes
   * @returns {{cost: number, maxRisk: number, maxProfit: number, breakevens: number[]}}
   */
  static butterfly(KL, KM, KH, quotes) {
    const buyL = quotes[KL].call.ask;
    const sellM = quotes[KM].call.bid;
    const buyH = quotes[KH].call.ask;
    const cost = buyL + buyH - 2 * sellM;
    const width = KH - KL;
    return {
      cost,
      maxRisk: cost,
      maxProfit: width - cost,
      breakevens: [KL + cost, KH - cost],
    };
  }
}

// —— 範例：把你截圖裡的那些價格放到 quotes 中，然後直接呼叫 ——

// 假設我們已經從截圖讀到：
const quotes = {
  22000: { call: { bid: 40, ask: 58 }, put: { bid: 122, ask: 143 } },
  22100: { call: { bid: 31, ask: 59 }, put: { bid: 96, ask: 137 } },
  22200: { call: { bid: 28, ask: 78 }, put: { bid: 75, ask: 214 } },
  22300: { call: { bid: 27, ask: 42.5 }, put: { bid: 96, ask: 137 } },
  22400: { call: { bid: 58, ask: 22.5 }, put: { bid: 58, ask: 255 } },
  22500: { call: { bid: 32.5, ask: 11 }, put: { bid: 32, ask: 340 } },
};

console.log(
  "Straddle @22200:",
  OptionStrategyCalculator.straddle(22200, quotes)
);
console.log(
  "Strangle @21900/22400:",
  OptionStrategyCalculator.strangle(21900, 22400, quotes)
);
console.log(
  "Bull Call Spread 22200→22400:",
  OptionStrategyCalculator.bullCallSpread(22200, 22400, quotes)
);
console.log(
  "Bear Put Spread 22200→22000:",
  OptionStrategyCalculator.bearPutSpread(22200, 22000, quotes)
);
console.log(
  "Iron Condor 22300/22400/22100/22000:",
  OptionStrategyCalculator.ironCondor(22300, 22400, 22100, 22000, quotes)
);
console.log(
  "Butterfly 22000/22100/22200:",
  OptionStrategyCalculator.butterfly(22000, 22100, 22200, quotes)
);
