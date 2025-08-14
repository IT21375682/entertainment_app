// controllers/stories.js
import Story from "../models/Story.js"
import mongoose from "mongoose"

export const bulkUpsertStories = async (req, res) => {
  try {
    const items = Array.isArray(req.body) ? req.body : (req.body.items || [])
    if (!items.length) return res.status(200).json({ ok: true, n: 0 })

    const now = new Date()
    const ops = items.map((it) => {
      // Normalize dates into Date objects
      const publishedAt = it.publishedAt ? new Date(it.publishedAt) : undefined

      // Build filter by priority
      const filter =
        (it.canonicalUrl && { canonicalUrl: it.canonicalUrl }) ||
        (it.source && it.guid && { source: String(it.source), guid: String(it.guid) }) ||
        (it.fingerprint && { fingerprint: it.fingerprint }) ||
        // As a last resort (if client didn’t send precomputed keys),
        // rely on schema’s pre-validate to compute fingerprint:
        { title: it.title, link: it.link }

      return {
        updateOne: {
          filter,
          update: {
            $setOnInsert: {
              title: it.title,
              summary: it.summary,
              content: it.content,
              image: it.image,
              link: it.link,
              canonicalUrl: it.canonicalUrl, // will be filled by pre-validate if missing
              source: it.source,
              guid: it.guid,
              fingerprint: it.fingerprint,   // will be filled by pre-validate if missing
              category: it.category,
              tags: it.tags || [],
              publishedAt,
              createdAt: now,
            },
            $set: {
              // update rolling fields each run if you want (image/title can drift)
              updatedAt: now,
              // example: keep category/tags fresh
              // category: it.category,
              // tags: it.tags || [],
            },
          },
          upsert: true,
        },
      }
    })

    const result = await Story.bulkWrite(ops, { ordered: false })
    res.status(200).json({
      ok: true,
      upserted: result.upsertedCount || 0,
      matched: result.matchedCount || 0,
      modified: result.modifiedCount || 0,
    })
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ ok: false, code: "DUP_KEY", error: err.message })
    }
    res.status(500).json({ ok: false, error: err.message })
  }
}


export const getAllStories = async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 })
    res.json(stories)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}