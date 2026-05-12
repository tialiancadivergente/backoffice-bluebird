export const LEADS_API_BASE_URL = import.meta.env.DEV
  ? "/leads-api"
  : "https://leads-api.aliancadivergente.com.br";

const LEADS_API_KEY = import.meta.env.DEV ? undefined : import.meta.env.VITE_LEADS_API_KEY;

export const LEADS_API_HEADERS = {
  "Content-Type": "application/json",
  ...(LEADS_API_KEY ? { "x-api-key": LEADS_API_KEY } : {}),
};
