import { OpenAIApi, Configuration } from 'openai-edge';

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

export async function getEmbeddings(text: string) {
  try {
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid input text');
    }

    const response = await openai.createEmbedding({
      model: 'text-embedding-ada-002',
      input: text.replace(/\n/g, ''),
    });

    if (!response.ok) {
      const errorDetails = await response.json();
      console.error('API Error Details:', errorDetails);
      throw new Error(`API returned an error: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Embeddings Response:', result); // Debugging the response structure
    return result.data[0]?.embedding as number[]; // Safe access using optional chaining
  } catch (error) {
    console.error('Error in getEmbeddings:', error);
    throw error;
  }
}
