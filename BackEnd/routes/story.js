// routes/stories.ts
import express from "express";
import Story from "../models/stories.js";

const router = express.Router();

/**
 * POST /api/stories/bulk
 * Body: { items: [{title, link, summary, image, source, category, tags, publishedAt, content}] }
 * Upserts by link.
 */
router.post("/bulk", async (req, res) => {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    if (!items.length) return res.status(400).json({ error: "No items" });

    const ops = items.map((doc) => ({
      updateOne: { filter: { link: doc.link }, update: { $set: doc }, upsert: true }
    }));

    const result = await Story.bulkWrite(ops, { ordered: false });
    res.json({ ok: true, upserted: result.upsertedCount, modified: result.modifiedCount });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
