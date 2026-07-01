const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock_key');

/**
 * Service: Diet Analysis
 * Purpose: Parses food images and analyzes nutritional macros via Antigravity Vision
 */
const analyzeDietPhoto = async (photoUrl) => {
  try {
    console.log('[Antigravity Vision] Fetching image from URL:', photoUrl);
    // 1. Download the image from the public Cloudflare R2 URL
    const imageResponse = await fetch(photoUrl);
    const arrayBuffer = await imageResponse.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString('base64');
    const mediaType = imageResponse.headers.get('content-type') || 'image/jpeg';

    console.log('[Antigravity Vision] Sending image to Gemini...');
    
    // 2. Ask Gemini to analyze the image
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = "You are an expert nutritionist. Analyze the food in the image. Return ONLY a valid JSON array of objects. Each object must have: 'name' (string), 'quantityG' (number), 'calories' (number), 'proteinG' (number), 'carbsG' (number), 'fatG' (number). Estimate conservative portions if unsure. Do not include markdown code blocks, ONLY the raw JSON.";
    
    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: mediaType
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const responseText = result.response.text().trim();
    
    // 3. Parse Gemini's JSON response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    const parsedData = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(responseText);

    let totalCalories = 0;
    parsedData.forEach(item => totalCalories += item.calories);

    console.log('[Antigravity Vision] Successfully parsed food data:', parsedData);

    return { 
      detectedItems: parsedData,
      estimatedCalories: totalCalories,
      confidence: 'high'
    };
  } catch (error) {
    console.error("[Antigravity Vision Error]:", error);
    throw new Error("Failed to analyze diet photo");
  }
};

module.exports = {
  analyzeDietPhoto
};
