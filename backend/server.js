const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { InferenceClient } = require('@huggingface/inference');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const hf = new InferenceClient(process.env.HF_TOKEN);

app.post('/api/solve', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "No image data provided" });
    }

    console.log("Image received! Routing to Blip Image Captioning API...");

    // 1. Convert base64 data to a Web Blob for standard inference
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const imageBlob = new Blob([imageBuffer]);

    // 2. Call the serverless image-to-text pipeline
    const response = await hf.imageToText({
      model: "Salesforce/blip-image-captioning-large",
      data: imageBlob,
    });

    const parsedText = response.generated_text;
    console.log("Raw OCR Output:", parsedText); // Look at your Render logs to see what it saw!

    // 3. Robust Regex: Strip out text words, letters, and isolate the math expression
    // This removes common image captioning prefixes like "a drawing of", "written text", etc.
    let cleanedExpression = parsedText
      .replace(/[a-zA-Z]/g, '') // Strip out all alphabetic characters
      .replace(/=/g, '')        // Strip out existing equals signs
      .trim();

    // 4. Safely evaluate the expression inside Node.js
    let evaluation = "";
    if (/^[0-9+\-*/().\s]+$/.test(cleanedExpression) && cleanedExpression.length > 0) {
      try {
        const mathResult = new Function(`return ${cleanedExpression}`)();
        evaluation = mathResult.toString();
      } catch (mathErr) {
        evaluation = "?";
      }
    } else {
      evaluation = "?";
    }

    // 5. Send back formatted math representation
    const finalLaTeX = `${cleanedExpression} = ${evaluation}`;
    res.json({ result: finalLaTeX });

  } catch (error) {
    console.error("Hugging Face API Error:", error.message);
    res.status(500).json({ error: "AI Processing Failed", details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});