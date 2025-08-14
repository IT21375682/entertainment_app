// models/story.js
import mongoose from "mongoose"
import crypto from "crypto"
import { URL } from "url"

function canonicalizeUrl(raw) {
  if (!raw) return null
  try {
    const u = new URL(raw)
    u.hash = ""                       // drop #fragments
    u.searchParams.forEach((_, k) => {
      // drop common tracking params
      const junk = ["utm_source","utm_medium","utm_campaign","utm_term","utm_content","fbclid","gclid","mc_cid","mc_eid"]
      if (junk.includes(k.toLowerCase())) u.searchParams.delete(k)
    })
    // lower-case host, keep path/case as-is
    u.host = u.host.toLowerCase()
    return u.toString()
  } catch { return raw }              // if it’s not a real URL, fall back
}

function makeFingerprint(doc) {
  // Priority: canonicalUrl → (source|guid) → (source|title|date)
  const basis =
    (doc.canonicalUrl || "").trim().toLowerCase() ||
    `${(doc.source||"").trim().toLowerCase()}|${(doc.guid||"").trim().toLowerCase()}` ||
    `${(doc.source||"").trim().toLowerCase()}|${(doc.title||"").trim().toLowerCase()}|${(doc.publishedAt||"").slice(0,10)}`
  return crypto.createHash("sha256").update(basis).digest("hex")
}

const storySchema = new mongoose.Schema({
  // Core
  title: { type: String, required: true },
  summary: String,
  content: [String],
  image: String,

  // Source + identity
  link: String,               // raw link as provided (optional to store)
  canonicalUrl: String,       // normalized link (used for de-dupe)
  source: String,             // feed/site name or origin
  guid: String,               // feed entry id if available
  fingerprint: { type: String, required: true }, // computed

  // Classification
  category: String,           // "sports" | "movies" | "blogs" | etc.
  tags: [String],

  // Dates
  publishedAt: Date,
}, { timestamps: true })

// Uniqueness guarantees (sparse so they only apply when the field exists)
storySchema.index({ canonicalUrl: 1 }, { unique: true, sparse: true })
storySchema.index({ source: 1, guid: 1 }, { unique: true, sparse: true })
storySchema.index({ fingerprint: 1 }, { unique: true }) // always present

storySchema.pre("validate", function (next) {
  if (this.link && !this.canonicalUrl) this.canonicalUrl = canonicalizeUrl(this.link)
  if (!this.fingerprint) this.fingerprint = makeFingerprint(this)
  next()
})

export default mongoose.models.Story || mongoose.model("Story", storySchema)
