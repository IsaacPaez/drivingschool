const FORBIDDEN_DOMAINS = [
  "convergepay.com",
  "api.demo.convergepay.com",
  "demo.convergepay.com"
];

export async function secureFetch(input: RequestInfo, init?: RequestInit) {
  const url = typeof input === "string" ? input : input.url;
  if (FORBIDDEN_DOMAINS.some(domain => url.includes(domain))) {
    throw new Error(`[SECURE_FETCH] 🚫 Prohibido hacer fetch a ConvergePay desde el backend de Next.js. Usa el EC2! URL: ${url}`);
  }
  return fetch(input, init);
} 