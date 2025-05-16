import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI no está definida en el archivo .env.local");
}

// 🔹 Mantener `connectDB` para no afectar `products`
export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection.db; // ✅ Retornar la conexión
  }
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: "DrivingSchool_Admin",
    });
    return mongoose.connection.db; // ✅ Ahora devuelve el `Db`
  } catch (error) {
    console.error("❌ Error conectando a MongoDB Atlas:", error);
    throw error; // Re-lanzar el error para evitar fallos silenciosos
  }
};

// 🔹 Alias para evitar modificar `products`
export const connectToDatabase = connectDB;
