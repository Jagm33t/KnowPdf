import { Pinecone } from "@pinecone-database/pinecone";
import { convertToAscii } from "./utils";
import { getEmbeddings } from "./embeddings";

export async function getMatchesFromEmbeddings(
  embeddings: number[],
  fileKey: string
) {
  try {
    const client = new Pinecone({
      // environment: process.env.PINECONE_ENVIRONMENT!,
      apiKey: process.env.PINECONE_API_KEY!,
    });
    const pineconeIndex = await client.index("know-pdf");
    const namespace = pineconeIndex.namespace(convertToAscii(fileKey));
    const queryResult = await namespace.query({
      topK: 5,
      vector: embeddings,
      includeMetadata: true,
    });
    return queryResult.matches || [];
  } catch (error) {
    console.log("error querying embeddings", error);
    throw error;
  }
}

export async function getContext(query: string, fileKey: string) {
  const queryEmbeddings = await getEmbeddings(query);
  const matches = await getMatchesFromEmbeddings(queryEmbeddings, fileKey);

  const qualifyingDocs = matches.filter(
    (match) => match.score && match.score > 0.7
  );

  type Metadata = {
    text: string;
    pageNumber: number;
  };

  let docs = qualifyingDocs.map((match) => (match.metadata as Metadata).text);
  // 5 vectors
  return docs.join("\n").substring(0, 3000);
}

export async function getContextFromSelectedText(selectedText: string, fileKey: string) {
  try {
    // Generate embeddings for the selected text
    const queryEmbeddings = await getEmbeddings(selectedText);

    // Initialize Pinecone client
    const client = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    const pineconeIndex = await client.index("know-pdf");
    const namespace = pineconeIndex.namespace(convertToAscii(fileKey));

    // Query Pinecone with the embeddings
    const queryResult = await namespace.query({
      topK: 5,
      vector: queryEmbeddings,
      includeMetadata: true,
    });

    // Filter matches with a score higher than 0.7
    const qualifyingDocs = queryResult.matches.filter(
      (match) => match.score && match.score > 0.7
    );

    // Extract metadata from the matches
    type Metadata = {
      text: string;
      pageNumber: number;
    };

    const docs = qualifyingDocs.map((match) => (match.metadata as Metadata).text);

    // Join the results and limit context length to 3000 characters
    return docs.join("\n").substring(0, 3000);
  } catch (error) {
    console.error("Error fetching context:", error);
    throw error;
  }
}