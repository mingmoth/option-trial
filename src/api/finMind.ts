const FINDMINDTRADE_API = "/finMind";
const TOKEN = import.meta.env.VITE_FINMIND_TOKEN;
const DATA_SET = "TaiwanFutOptTickInfo";
// const DATA_ID = 'TX220400G5'

export async function getOptionAPI() {
  try {
    const response = await fetch(`${FINDMINDTRADE_API}?dataset=${DATA_SET}`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`, // 請將 YOUR_TOKEN_HERE 替換成您的 Token
      },
    });
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("API 請求失敗:", error);
  }
}
