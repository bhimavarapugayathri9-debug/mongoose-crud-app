
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const port = process.env.PORT || 8000;

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  director: { type: String },
  category: { type: String, required: true },
  year: { type: Number, required: true }
});

const Movie = mongoose.model("Movie", movieSchema);

app.post("/api/v1/movie", async (req, res) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(200).json({
      message: "Movie created successfully",
      data: movie
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!movie)
      return res.status(404).json({ message: "Movie not found" });
    res.status(200).json({
      message: "Movie updated successfully",
      data: movie
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/api/v1/movie/:id", async (req, res) => {
  try {
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

mongoose.connect(process.env.MONGO_URL, {
  dbName: process.env.DB_NAME
})
.then(() => {
  console.log("Connected to MongoDB");
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
})
.catch(err => console.error("Connection failed:", err));
