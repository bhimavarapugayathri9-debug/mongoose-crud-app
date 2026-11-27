import "dotenv/config";
import express from "express";
import mongoose from "mongoose";

const app = express();
app.use(express.json());

const port = Number(process.env.PORT) || 8000;

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  director: { type: String },
  category: { type: String, required: true },
  year: { type: Number, required: true }
});

const Movie = mongoose.model("Movie", movieSchema);

app.post("/api/v1/movie", async (req, res) => {
  try {
    const movie = await Movie.create(req.body || {});
    res.status(200).json({
      message: "Movie created successfully",
      data: movie
    });
  } catch (err) {
    const status = err.name === "ValidationError" ? 400 : 500;
    res.status(status).json({ message: err.message });
  }
});

app.get("/api/v1/movie", async (req, res) => {
  try {
    const query = req.query.category
      ? { category: req.query.category }
      : {};
    const movies = await Movie.find(query);
    res.status(200).json({
      message: "Movies fetched successfully",
      data: movies
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/api/v1/movie/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: "Invalid movie ID" });
    const movie = await Movie.findById(req.params.id);
    if (!movie)
      return res.status(404).json({ message: "Movie not found" });
    res.status(200).json({
      message: "Movie details fetched successfully",
      data: movie
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/api/v1/movie/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: "Invalid movie ID" });
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body || {},
      { new: true, runValidators: true }
    );
    if (!movie)
      return res.status(404).json({ message: "Movie not found" });
    res.status(200).json({
      message: "Movie updated successfully",
      data: movie
    });
  } catch (err) {
    const status = err.name === "ValidationError" ? 400 : 500;
    res.status(status).json({ message: err.message });
  }
});

app.delete("/api/v1/movie/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: "Invalid movie ID" });
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie)
      return res.status(404).json({ message: "Movie not found" });
    res.status(200).json({
      message: "Movie deleted successfully",
      data: movie
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Movie API server running"
  });
});

const mongoUri = (
  process.env.MONGO_URL ||
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  ""
).trim();

if (!mongoUri) {
  console.error(
    "Error: MongoDB connection URI is missing. Set MONGO_URL (or MONGO_URI / MONGODB_URI) in your environment variables."
  );
  process.exit(1);
}

const connectOptions = process.env.DB_NAME
  ? { dbName: process.env.DB_NAME.trim() }
  : {};

mongoose
  .connect(mongoUri, connectOptions)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Connection failed:", err.message);
    process.exit(1);
  });
