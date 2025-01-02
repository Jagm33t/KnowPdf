import AWS from 'aws-sdk';
import fs from 'fs';

export async function downloadFromS3(file_key: string) {
  try {
    const s3 = new AWS.S3({
      region: "us-west-2",
    });

    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: file_key,
    };

    // Use stream for large files to avoid memory issues
    const stream = s3.getObject(params).createReadStream();
    const file_name = `/tmp/pdf-${Date.now()}.pdf`;

    // Pipe the stream directly to a file
    const writeStream = fs.createWriteStream(file_name);
    stream.pipe(writeStream);

    writeStream.on('finish', () => {
      console.log(`File saved to: ${file_name}`);
    });

    return file_name;
  } catch (error) {
    console.error("Error downloading from S3:", error);
    return null;
  }
}
