import { EC2Client, StartInstancesCommand, DescribeInstancesCommand } from "@aws-sdk/client-ec2";

const ec2 = new EC2Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function startAndWaitEC2(instanceId: string) {
  // 1. Intenta encender la instancia
  await ec2.send(new StartInstancesCommand({ InstanceIds: [instanceId] }));

  // 2. Espera a que esté en estado "running"
  let state = "";
  for (let i = 0; i < 30; i++) { // Espera hasta 30 intentos (~1.5 minutos)
    const res = await ec2.send(new DescribeInstancesCommand({ InstanceIds: [instanceId] }));
    state = res.Reservations?.[0]?.Instances?.[0]?.State?.Name || "";
    if (state === "running") break;
    await new Promise(r => setTimeout(r, 3000)); // Espera 3 segundos
  }
  return state === "running";
} 