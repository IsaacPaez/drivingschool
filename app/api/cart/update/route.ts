import { sendCartUpdate } from '@/lib/cartUpdates';

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, cart } = body;
  if (!userId || !cart) {
    return new Response('Missing userId or cart', { status: 400 });
  }
  // Aquí normalmente actualizarías el carrito en la base de datos
  // Simulación: notificar a los clientes conectados
  sendCartUpdate(userId, cart);
  return new Response('Cart updated and clients notified', { status: 200 });
} 