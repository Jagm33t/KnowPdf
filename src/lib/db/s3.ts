import AWS from "aws-sdk";

export async function uploadToS3(file: File) {
  try {
    const s3 = new AWS.S3({
      region: "us-west-2",
      httpOptions: {
        timeout: 300000, // Set timeout to 5 minutes (adjust if necessary)
      },
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
      },
    });

    const file_key =
      "uploads/" + Date.now().toString() + file.name.replace(" ", "-");

    const params = {
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: file_key,
      Body: file,
    };

    // Upload the file to S3 and track progress
    const upload = s3
      .upload(params)
      .on("httpUploadProgress", (evt: AWS.S3.ManagedUpload.Progress) => {
        const progress = Math.round((evt.loaded * 100) / evt.total);
        console.log(`${progress}%`);
      })
      .promise();

    // Wait for the upload to complete
    await upload;
  

    return {
      file_key,
      file_name: file.name,
    };
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("File upload failed");
  }
}


// Function to delete file from S3 based on chatId
export async function deleteS3File(fileKey: string) {
  try {
    const s3 = new AWS.S3({
      region: process.env.NEXT_PUBLIC_S3_REGION!,
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
      },
    });

    // Delete the file from S3
    const result = await s3
      .deleteObject({
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
        Key: fileKey,
      })
      .promise();

    

    // Return success status
    return { success: true, result };
  } catch (error) {
    console.error("Error deleting file from S3:", error);

    // Return failure status
    return { success: false, error };
  }
}


export function getS3Url(file_key: string) {
  console.log("Inside getS3Url function");
  const url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_S3_REGION}.amazonaws.com/${file_key}`;
  console.log("jatttttttttttttttttttttt",url)
  return url;
}
