const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 1. Use the new InferenceClient from the updated SDK
const { InferenceClient } = require('@huggingface/inference');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 2. Initialize the client
const hf = new InferenceClient(process.env.HF_TOKEN);

app.post('/api/solve', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "No image data provided" });
    }

    console.log("Image received! Processing with modern Hugging Face SDK...");

    // 3. Convert the base64 data into a Web Blob (Required for the new API)
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const imageBlob = new Blob([imageBuffer]);

    // 4. Call the OCR model
    const ocrResponse = await hf.imageToText({
      model: 'microsoft/trocr-base-handwritten',
      data: imageBlob,
    });

    const parsedText = ocrResponse.generated_text;
    console.log("OCR Parsed Text:", parsedText); 

    // Clean up the text (remove spaces, trailing equals signs, etc.)
    let cleanedExpression = parsedText.replace(/=/g, '').trim();

    // Evaluate the math equation safely
    let evaluation = "";
    if (/^[0-9+\-*/().\s]+$/.test(cleanedExpression)) {
      try {
        const mathResult = new Function(`return ${cleanedExpression}`)();
        evaluation = mathResult.toString();
      } catch (mathErr) {
        evaluation = "?";
      }
    } else {
      evaluation = "?";
    }

    const finalLaTeX = `${cleanedExpression} = ${evaluation}`;

    res.json({ result: finalLaTeX });

  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});