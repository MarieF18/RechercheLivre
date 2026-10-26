const express = require("express");
const mongoose = require("mongoose");
const Book = require("./models/Book");

const app = express();

app.use(express.json());

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parsePositiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

app.post("/items", async (req, res, next) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (error) {
    next(error);
  }
});

app.get("/items", async (req, res, next) => {
  try {
    const page = parsePositiveInteger(req.query.page, 1);
    const limit = Math.min(parsePositiveInteger(req.query.limit, 10), 100);
    const [items, total] = await Promise.all([
      Book.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Book.countDocuments(),
    ]);

    res.json({ items, page, limit, total });
  } catch (error) {
    next(error);
  }
});

app.get("/items/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Identifiant de livre invalide." });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ error: "Livre introuvable." });
    }

    res.json(book);
  } catch (error) {
    next(error);
  }
});

app.get("/search", async (req, res, next) => {
  try {
    const keyword = typeof req.query.keyword === "string" ? req.query.keyword.trim() : "";
    if (!keyword) {
      return res.status(400).json({ error: "Le paramètre keyword est obligatoire." });
    }

    const searchRegex = { $regex: escapeRegex(keyword), $options: "i" };
    const query = {
      $or: [
        { title: searchRegex },
        { author: searchRegex },
        { description: searchRegex },
      ],
    };

    if (typeof req.query.genre === "string" && req.query.genre.trim()) {
      query.genre = {
        $regex: `^${escapeRegex(req.query.genre.trim())}$`,
        $options: "i",
      };
    }

    const items = await Book.find(query).sort({ title: 1 });
    res.json({ items, total: items.length });
  } catch (error) {
    next(error);
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Route introuvable." });
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ error: "Corps JSON invalide." });
  }
  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({ error: error.message });
  }

  console.error(error);
  res.status(500).json({ error: "Une erreur interne est survenue." });
});

module.exports = app;
