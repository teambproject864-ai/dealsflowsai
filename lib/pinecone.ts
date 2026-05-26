import { Pinecone } from '@pinecone-database/pinecone';

const apiKey = (process.env.PINECONE_API_KEY || "").trim();
const indexName = process.env.PINECONE_INDEX || 'quickstart';
const dimension = parseInt(process.env.PINECONE_DIMENSION || '384'); // Matching HuggingFace all-MiniLM-L6-v2
const metric = (process.env.PINECONE_METRIC as 'cosine' | 'euclidean' | 'dotproduct') || 'cosine';

let pc: Pinecone | null = null;

function getPineconeClient(): Pinecone | null {
  if (!apiKey) {
    console.warn('PINECONE_API_KEY is missing or invalid. Vector operations will be limited.');
    return null;
  }
  
  if (!pc) {
    try {
      pc = new Pinecone({ apiKey });
    } catch (error) {
      console.error('Failed to initialize Pinecone client:', error);
      return null;
    }
  }
  
  return pc;
}

/**
 * Ensures the Pinecone index exists with the correct configuration.
 */
export async function initPineconeIndex() {
  const client = getPineconeClient();
  if (!client) {
    throw new Error('Pinecone client not available - check PINECONE_API_KEY');
  }
  
  try {
    const response = await client.listIndexes();
    const indexExists = response.indexes?.some(idx => idx.name === indexName);

    if (!indexExists) {
      console.log(`Creating Pinecone index: ${indexName} (dim: ${dimension}, metric: ${metric})...`);
      await client.createIndex({
        name: indexName,
        dimension,
        metric,
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1'
          }
        }
      });
      console.log('Pinecone index created successfully.');
      
      // Wait for index to be ready
      let ready = false;
      while (!ready) {
        const description = await client.describeIndex(indexName);
        if (description.status?.ready) {
          ready = true;
        } else {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    return client.index(indexName);
  } catch (error) {
    console.error('Failed to initialize Pinecone index:', error);
    throw error;
  }
}

/**
 * Gets the Pinecone index instance with automatic initialization check.
 */
export async function getPineconeIndex() {
  const client = getPineconeClient();
  if (!client) {
    return null;
  }
  
  try {
    return client.index(indexName);
  } catch (error) {
    console.error('Error getting Pinecone index:', error);
    return null;
  }
}

export { getPineconeClient };
export default getPineconeClient();
