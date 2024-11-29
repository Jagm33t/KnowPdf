import { PineconeClient } from '@pinecone-database/pinecone';
import { downloadFromS3 } from './s3-server';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";


let pinecone: PineconeClient | null = null;

export const getPineconeClient = async (): Promise<PineconeClient> => {
  if (!pinecone) {
    pinecone = new PineconeClient();
    await pinecone.init({
      environment: process.env.PINECONE_ENVIRONMENT!, 
      apiKey: process.env.PINECONE_API_KEY!        
    });
  }
  return pinecone;
};

type PDFPage = {
  pageContent: string;
  metadata: {
    loc: { pageNumber: number };
  };
};


export async function loadS3IntoPinecone(fileKey: string) {
  // obtain the pdf and download and read from pdf
  console.log('downlaoding s3 into file system')
  const file_name = await downloadFromS3(fileKey);
  if (!file_name) {
    throw new Error("could not download from s3");
  }
  const loader = new PDFLoader(file_name);
  const pages = (await loader.load()) as PDFPage[];
  console.log('Extracted Pages:', pages);
  if (pages.length === 0) {
    console.log('No pages extracted from PDF.');
  } else {
    console.log('Pages extracted:', pages);
  }
  return pages;
}