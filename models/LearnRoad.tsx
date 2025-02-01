import mongoose from "mongoose";

const LearnRoadSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  buttonLabel: String,
}, { collection: "learnroad" }); // 🔹 Nombre de la colección en MongoDB

export default mongoose.models.LearnRoad || mongoose.model("LearnRoad", LearnRoadSchema);
