let clients: any[] = [];

// Función para enviar actualización a los clientes conectados
export function sendCartUpdate(userId: string, cart: any) {
  for (const client of clients) {
    if (client.userId === userId) {
      client.controller.enqueue(`data: ${JSON.stringify({ type: "update", cart })}\n\n`);
    }
  }
}

// Función para agregar un nuevo cliente
export function addClient(client: any) {
  clients.push(client);
}

// Función para remover un cliente
export function removeClient(client: any) {
  clients = clients.filter(c => c !== client);
}

// Función para obtener todos los clientes (para debugging)
export function getClients() {
  return clients;
} 