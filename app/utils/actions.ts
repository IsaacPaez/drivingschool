export async function saveActionData(type: string, actionData: any) {
  try {
    const response = await fetch("/api/save/save-action", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ type, ...actionData }),
    });

    if (!response.ok) {
      throw new Error("Error guardando la acción.");
    }
  } catch (error) {
    console.error("Error en saveActionData:", error);
  }
}
