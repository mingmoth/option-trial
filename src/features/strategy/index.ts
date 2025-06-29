interface BidAskPrices {
  bid: number;
  ask: number;
}

interface CallPutQuote {
  call: BidAskPrices;
  put: BidAskPrices;
}

export interface Quotes {
  [key: number]: CallPutQuote;
}

/**
 * OptionStrategyCalculator
 * 提供六種常見期權複式單計算：
 * - Straddle, Strangle, BullCallSpread, BearPutSpread, IronCondor, Butterfly
 */
export class OptionStrategyCalculator {
  /**
   * Long Straddle (買跨式)
   * @param {number} K ATM 履約價
   * @param {Quotes} quotes
   * @returns {{cost: number, maxRisk: number, maxProfit: number, breakevens: number[]}}
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
   * @param {Quotes} quotes
   * @returns {{cost: number, maxRisk: number, maxProfit: number, breakevens: number[]}}
   */
  static strangle(K1: number, K2: number, quotes: Quotes) {
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
   * @param {Quotes} quotes
   * @returns {{cost: number, maxRisk: number, maxProfit: number, breakeven: number}}
   */
  static bullCallSpread(K_low: number, K_high: number, quotes: Quotes) {
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
   * @param {Quotes} quotes
   * @returns {{cost: number, maxRisk: number, maxProfit: number, breakeven: number}}
   */
  static bearPutSpread(K_high: number, K_low: number, quotes: Quotes) {
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
   * Iron Condor (鐵兀鷹)
   * @param {number} Kp1 買入較低的 Put 履約價
   * @param {number} Kp2 賣出較高的 Put 履約價
   * @param {number} Kc1 賣出較低的 Call 履約價
   * @param {number} Kc2 買入較高的 Call 履約價
   * @param {Quotes} quotes
   * @returns {{credit: number, maxRisk: number, maxProfit: number, breakevens: number[]}}
   */
  static ironCondor(Kp1: number, Kp2: number, Kc1: number, Kc2: number, quotes: Quotes) {
    // Call 端：賣 Kc1、買 Kc2
    const callCredit = quotes[Kc1].call.bid - quotes[Kc2].call.ask;
    // Put  端：賣 Kp2、買 Kp1
    const putCredit = quotes[Kp2].put.bid - quotes[Kp1].put.ask;
    const totalCredit = callCredit + putCredit;
    // 風險 = 任一端寬度 - 該端 credit，以最壞端計
    const riskCall = Kc2 - Kc1 - callCredit;
    const riskPut = Kp2 - Kp1 - putCredit;
    return {
      credit: totalCredit,
      maxProfit: totalCredit,
      maxRisk: Math.max(riskCall, riskPut),
      breakevens: [Kp2 - totalCredit, Kc1 + totalCredit]
    };
  }

  /**
   * Butterfly (蝶式)
   * @param {number} KL 低履約價 (買入)
   * @param {number} KM 中樞履約價 (賣出兩口)
   * @param {number} KH 高履約價 (買入)
   * @param {Quotes} quotes
   * @returns {{cost: number, maxRisk: number, maxProfit: number, breakevens: number[]}}
   */
  static butterfly(KL: number, KM: number, KH: number, quotes: Quotes) {
    const buyL = quotes[KL].call.ask;
    const sellM = quotes[KM].call.bid;
    const buyH = quotes[KH].call.ask;
    const cost = buyL + buyH - 2 * sellM;
    const width = KM - KL; // 蝶式的一翼寬度
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
// 注意：我修正了您範例資料中 22400-22500 的 call/put bid/ask，使其更符合市場常理
const quotes: Quotes = {
  22000: { call: { bid: 122, ask: 143 }, put: { bid: 40, ask: 58 } },
  22100: { call: { bid: 96, ask: 137 }, put: { bid: 31, ask: 59 } },
  22200: { call: { bid: 75, ask: 98 }, put: { bid: 28, ask: 78 } },
  22300: { call: { bid: 40, ask: 52.5 }, put: { bid: 96, ask: 137 } },
  22400: { call: { bid: 20.5, ask: 22.5 }, put: { bid: 235, ask: 255 } },
  22500: { call: { bid: 9, ask: 11 }, put: { bid: 320, ask: 340 } },
};

console.log(
  "Straddle @22200:",
  OptionStrategyCalculator.straddle(22200, quotes)
);

// [修正] Strangle 範例改用 quotes 中存在的履約價 (e.g., 22000 and 22400)
console.log(
  "Strangle @22000/22400:",
  OptionStrategyCalculator.strangle(22000, 22400, quotes)
);

console.log(
  "Bull Call Spread 22200→22400:",
  OptionStrategyCalculator.bullCallSpread(22200, 22400, quotes)
);

console.log(
  "Bear Put Spread 22200→22000:",
  OptionStrategyCalculator.bearPutSpread(22200, 22000, quotes)
);

// [修正] Iron Condor 的履約價順序一般為 Kp1 < Kp2 < Kc1 < Kc2
// 範例：賣出 22100 Put & 22300 Call, 同時買入 22000 Put & 22400 Call 保護
console.log(
  "Iron Condor 22000/22100/22300/22400:",
  OptionStrategyCalculator.ironCondor(22000, 22100, 22300, 22400, quotes)
);

console.log(
  "Butterfly 22100/22200/22300:",
  OptionStrategyCalculator.butterfly(22100, 22200, 22300, quotes)
);