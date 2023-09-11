require("dotenv").config();

const mongoose = require("mongoose");

const shortenedUrlSchema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true,
  },
  short_url: {
    type: Number,
    required: true,
  },
});

const counterSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "counterName",
  },
  seq: {
    type: Number,
    default: 0,
  },
});

const Counter = mongoose.model("counter", counterSchema);

shortenedUrlSchema.pre("save", async function (next) {
  try {
    const counterDoc = await Counter.findOneAndUpdate(
      { name: "counterName" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    if (counterDoc) {
      this.short_url = counterDoc.seq;
      next();
    } else {
      throw new Error("Failed to obtain a short URL sequence number.");
    }
  } catch (error) {
    next(error);
  }
});

const ShortenedUrl = mongoose.model("ShortenedURL", shortenedUrlSchema);

const fetchCounter = async function () {
  try {
    let counterDoc = await Counter.findOne({ name: "counterName" });
    return counterDoc.seq;
  } catch (error) {
    console.log("Error", error);
    throw error;
  }
};

async function createShortenedUrl(url) {
  try {
    const newUrl = new ShortenedUrl({
      original_url: url,
      short_url: await fetchCounter(),
    });
    const data = await newUrl.save();
    return data;
  } catch (error) {
    console.log("Error saving record.", error);
    throw error;
  }
}

async function getOriginalUrl(url) {
  try {
    const data = await ShortenedUrl.findOne({ short_url: url });
    return data.original_url;
  } catch (error) {
    console.log("Error", error);
    throw error;
  }
}

module.exports = {
  createShortenedUrl,
  getOriginalUrl,
};
