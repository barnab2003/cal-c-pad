const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { InferenceClient } = require('@huggingface/inference');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const hf = new InferenceClient(process.env.HF_TOKEN);

// ... (keep the top imports and setup the exact same)

app.post('/api/solve', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "No image data provided" });
    }

    console.log("Image received! Routing to SmolVLM...");

    // 1. Switch to Hugging Face's hyper-fast, lightweight vision model
    const response = await hf.chatCompletion({
      model: "HuggingFaceTB/SmolVLM-Instruct",
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "Read the handwritten math equation in this image. Reply ONLY with the exact numbers and symbols you see. Do not add any other words." 
            },
            { 
              type: "image_url", 
              image_url: { url: image } 
            } 
          ]
        }
      ],
      max_tokens: 20
    });

    const parsedText = response.choices[0].message.content;
    console.log("AI Saw:", parsedText);

    let cleanedExpression = parsedText.replace(/=/g, '').trim();

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
    // Upgraded Error Logging!
    console.error("Hugging Face API Error:", error.message);
    // Send the exact error message back to the frontend so you aren't flying blind
    res.status(500).json({ error: "AI Processing Failed", details: error.message });
  }
});

// ... (keep the app.listen at the bottom the exact same)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});