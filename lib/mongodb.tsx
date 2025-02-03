import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI no está definida en el archivo .env.local");
}

// 🔹 Mantener `connectDB` para no afectar `products`
export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: "DrivingSchool_Admin", // 🔹 Forzar conexión a la base de datos correcta
    });
    console.log("✅ Conectado a MongoDB Atlas - Base de datos: DrivingSchool_Admin");
  } catch (error) {
    console.error("❌ Error conectando a MongoDB Atlas:", error);
  }
};

// 🔹 Nueva función `connectToDatabase` para `collections`
export const connectToDatabase = connectDB; // ✅ Alias para evitar modificar `products`
