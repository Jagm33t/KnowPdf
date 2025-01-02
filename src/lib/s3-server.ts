import AWS from 'aws-sdk';
import fs from 'fs';
export async function downloadFromS3(file_key: string) {
  try {
    // Configure AWS with the credentials
    AWS.config.update({
      accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
    });
    // Create an S3 client instance
    const s3 = new AWS.S3({
      region: "us-west-2", // Replace with your bucket's region
    });
    // Define the parameters for the S3 getObject request
    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: file_key, // Correct key name (case-sensitive)
    };
    // Fetch the file from S3
    const obj = await s3.getObject(params).promise();
    // Save the file locally
    const file_name = `/tmp/pdf-${Date.now()}.pdf`;
    fs.writeFileSync(file_name, obj.Body as Buffer);
    console.log(`File saved to: ${file_name}`);
    return file_name; // Return the path of the saved file
  } catch (error) {
    console.error("Error downloading from S3:", error);
    return null;
  }
}