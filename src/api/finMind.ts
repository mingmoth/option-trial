const FINDMINDTRADE_API = "/finMind";
const TOKEN =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJkYXRlIjoiMjAyNS0wNi0yOCAxNTozNjoyOSIsInVzZXJfaWQiOiJtaW5nbW90aCIsImlwIjoiMS4xNjguMzcuMjcifQ.fa4pCaA0FgFyGEWr09LyLxKzXXAcyzIg45Xp5DNuN9M";
const DATA_SET = "TaiwanFutOptTickInfo";
// const DATA_ID = 'TX220400G5'

async function getOptionAPI() {
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
