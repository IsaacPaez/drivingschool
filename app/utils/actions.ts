// Definimos una interfaz para los datos de la acción
interface ActionData {
  itemId?: string;
  title?: string;
  description?: string;
  price?: number;
}

// Tipamos el parámetro 'type' con valores específicos
type ActionType = "buy" | "book" | "contact";

export async function saveActionData(type: ActionType, actionData: ActionData) {
  try {
    const response = await fetch("/api/save/save-action", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type,
        data: actionData // Mejor estructuración del payload
      }),
    });

    if (!response.ok) {
      throw new Error("Error guardando la acción. Estado: " + response.status);
    }
    
    return await response.json(); // Devuelve la respuesta parseada
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error en saveActionData:", error.message);
      throw error; // Relanzamos el error para manejo superior
    }
    throw new Error("Error desconocido al guardar la acción");
  }
}