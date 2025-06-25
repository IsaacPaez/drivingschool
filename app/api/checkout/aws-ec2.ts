import { EC2Client, StartInstancesCommand, DescribeInstancesCommand } from "@aws-sdk/client-ec2";

const ec2 = new EC2Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function startAndWaitEC2(instanceId: string) {
  try {
    // 1. Verifica el estado actual
    let state = "";
    let describe = await ec2.send(new DescribeInstancesCommand({ InstanceIds: [instanceId] }));
    state = describe.Reservations?.[0]?.Instances?.[0]?.State?.Name || "";
    let publicIp = describe.Reservations?.[0]?.Instances?.[0]?.PublicIpAddress || "";
    //console.log(`[EC2] Estado inicial: ${state}, IP: ${publicIp}`);

    // 2. Si ya está running, retorna la IP
    if (state === "running") {
      //console.log("[EC2] La instancia ya está encendida.");
      return { success: true, publicIp };
    }

    // 3. Si está pending, solo espera
    if (state !== "pending") {
      // 4. Intenta encender la instancia
      //console.log("[EC2] Encendiendo la instancia...");
      await ec2.send(new StartInstancesCommand({ InstanceIds: [instanceId] }));
    } else {
      //console.log("[EC2] La instancia ya está en proceso de encendido (pending).");
    }

    // 5. Espera a que esté en estado "running"
    for (let i = 0; i < 60; i++) { // Hasta 3 minutos
      describe = await ec2.send(new DescribeInstancesCommand({ InstanceIds: [instanceId] }));
      state = describe.Reservations?.[0]?.Instances?.[0]?.State?.Name || "";
      publicIp = describe.Reservations?.[0]?.Instances?.[0]?.PublicIpAddress || "";
      //console.log(`[EC2] Intento ${i + 1}: Estado actual: ${state}, IP: ${publicIp}`);
      if (state === "running" && publicIp) {
        //console.log("[EC2] La instancia está encendida y lista.");
        return { success: true, publicIp };
      }
      await new Promise(r => setTimeout(r, 3000)); // Espera 3 segundos
    }
    //console.error("[EC2] No se pudo encender la instancia tras esperar 3 minutos.");
    return { success: false, error: "Timeout esperando a que la instancia esté running" };
  } catch (error) {
    console.error("[EC2] Error al encender o verificar la instancia:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
} 