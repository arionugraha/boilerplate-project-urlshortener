require("dotenv").config();

const mongoose = require("mongoose");

const shortenedUrlSchema = new mongoose.Schema({
    original_url: {
        type: String,
        required: true
    },
    short_url: {
        type: Number,
        required: true
    }
});

shortenedUrlSchema.pre("save", (next) => {
    if (!this.short_url) {
        this.short_url = Math.floor(Math.random() * 1000);
    }
    next();
})

const ShortenedUrl = mongoose.model("ShortenedURL", shortenedUrlSchema);

async function createShortenedUrl(url) {
    try {
        const newUrl = new ShortenedUrl({   
            original_url: url,
        });
        const data = await newUrl.save();
        return data;
    } catch (error) {
        console.log("Error saving record.", error);
        throw error;
    }
};

module.exports = {
    createShortenedUrl
};