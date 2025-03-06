export async function GET() {
  try {
    const response = await fetch(
      "https://www.convergepay.com/hosted-payments/myip"
    );
    const ip = await response.text();

    return new Response(JSON.stringify({ ip }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to fetch IP" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
