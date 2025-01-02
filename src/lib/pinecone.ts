import { Pinecone, PineconeRecord } from "@pinecone-database/pinecone";
import { downloadFromS3 } from "./s3-server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"; 
import md5 from "md5";
import {
  Document,
  RecursiveCharacterTextSplitter,
} from "@pinecone-database/doc-splitter";
import { getEmbeddings } from "./embeddings";
import { convertToAscii } from "./utils";

export const getPineconeClient = () => {
  return new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });
};

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};

export async function loadS3IntoPinecone(fileKey: string) {
  // 1. obtain the pdf -> downlaod and read from pdf
  console.log("downloading s3 into file system");
  const file_name = await downloadFromS3(fileKey);
  if (!file_name) {
    throw new Error("could not download from s3");
  }
  console.log("loading pdf into memory" + file_name);
  const loader = new PDFLoader(file_name);
  const pages = (await loader.load()) as PDFPage[];

  // 2. split and segment the pdf
  const documents = await Promise.all(pages.map(prepareDocument));

  // 3. vectorise and embed individual documents
  const vectors = await Promise.all(documents.flat().map(embedDocument));

  // 4. upload to pinecone
  const client = await getPineconeClient();
  const pineconeIndex = await client.index("know-pdf");
  const namespace = pineconeIndex.namespace(convertToAscii(fileKey));

  console.log("inserting vectors into pinecone");
  const batchSize = 100; // Adjust batch size based on the vector size
  const batches = [];
  for (let i = 0; i < vectors.length; i += batchSize) {
    batches.push(vectors.slice(i, i + batchSize));
  }

  // Upload batches to Pinecone
  for (const batch of batches) {
    try {
      await namespace.upsert(batch);
      console.log(`Batch of ${batch.length} vectors inserted successfully.`);
    } catch (error) {
      console.error("Error uploading batch to Pinecone:", error);
    }
  }

  // Return the first document as a sample
  return documents[0];
}

async function embedDocument(doc: Document) {
  try {
    const embeddings = await getEmbeddings(doc.pageContent);
    const hash = md5(doc.pageContent);

    return {
      id: hash,
      values: embeddings,
      metadata: {
        text: doc.metadata.text,
        pageNumber: doc.metadata.pageNumber,
      },
    } as PineconeRecord;
  } catch (error) {
    console.log("error embedding document", error);
    throw error;
  }
}

export const truncateStringByBytes = (str: string, bytes: number) => {
  const enc = new TextEncoder();
  return new TextDecoder("utf-8").decode(enc.encode(str).slice(0, bytes));
};

async function prepareDocument(page: PDFPage) {
  // eslint-disable-next-line prefer-const
  let { pageContent, metadata } = page; // You can use `let` here if you're mutating metadata properties

  pageContent = pageContent.replace(/\n/g, "");

  // Destructure metadata
  const { loc } = metadata;

  // Split the docs
  const splitter = new RecursiveCharacterTextSplitter();
  const docs = await splitter.splitDocuments([
    new Document({
      pageContent,
      metadata: {
        pageNumber: loc.pageNumber,
        text: truncateStringByBytes(pageContent, 36000),
      },
    }),
  ]);
  return docs;
}



export async function deleteEmbeddings(fileKey: string) {
  try {
    const client = await getPineconeClient();
    const pineconeIndex = await client.index("know-pdf");
    const namespace = pineconeIndex.namespace(fileKey); // Use fileKey to identify the namespace

    // Log the namespace deletion attempt
    console.log(`Attempting to delete all embeddings for namespace: ${fileKey}`);

    // Delete the entire namespace and all of its records
    const deleteResult = await namespace.deleteAll(); 

    // Log the result of the deletion
    console.log("Deletion result:", deleteResult);
    console.log(`Successfully initiated delete operation for embeddings in namespace: ${fileKey}`);

  } catch (error) {
    console.error("Error deleting embeddings from Pinecone:", error);
    throw error;
  }
}



