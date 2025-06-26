import axios from 'axios';

interface BookDetails {
  title: string;
  author: string;
  gradeLevel?: string;
  subject?: string;
  series?: string;
}

export const extractBookDetails = async (imageBuffer: Buffer): Promise<BookDetails> => {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Google API key not configured');
  }


  try {
    const base64Image = imageBuffer.toString('base64');
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [{
          parts: [
            { text: `Extract the following details from this book cover:
              - Title (most prominent text)
              - Author (usually smaller text below title)
              - Grade level (if mentioned)
              - Subject (if identifiable)
              - Series name (if part of a series)
              Return as valid JSON with these exact keys:
              {
                "title": string,
                "author": string,
                "gradeLevel": string | null,
                "subject": string | null,
                "series": string | null
              }` },
            { inline_data: { mime_type: "image/jpeg", data: base64Image } }
          ]
        }],
        generationConfig: { responseMimeType: "application/json" }
      },
      { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
    );

    const responseData = response.data;
    if (!responseData.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Unexpected API response format');
    }

    const jsonResponse = JSON.parse(responseData.candidates[0].content.parts[0].text);
    return {
      title: jsonResponse.title || '',
      author: jsonResponse.author || '',
      gradeLevel: jsonResponse.gradeLevel || undefined,
      subject: jsonResponse.subject || undefined,
      series: jsonResponse.series || undefined
    };
  } catch (error) {
    if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'data' in error.response) {
      // @ts-ignore
      console.error('Gemini API Error:', error.response.data);
    } else if (error instanceof Error) {
      console.error('Gemini API Error:', error.message);
    } else {
      console.error('Gemini API Error:', error);
    }
    throw new Error(`Failed to extract book details: ${error instanceof Error ? error.message : String(error)}`);
  }
};