"use client";
import { uploadToS3 } from "../../lib/db/s3";
import { useMutation } from "@tanstack/react-query";
import { Inbox, Loader2 } from "lucide-react";
import React from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";


type Props = {
  isPro: boolean;
};
const FileUpload = ({ isPro }: Props) => {
  const router = useRouter();
  const [uploading, setUploading] = React.useState(false); // Controls the uploading state
  const { mutate } = useMutation({
    mutationFn: async ({
      file_key,
      file_name,
    }: {
      file_key: string;
      file_name: string;
    }) => {
      const response = await axios.post("/api/create-chat", {
        file_key,
        file_name,
      });
      return response.data;
    },
  });
 
  const fileSizeLimit = isPro ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file.size > fileSizeLimit) {
        toast.error("File too large Subcribe to Pro ");
        return;
      }

      try {
        setUploading(true); // Set uploading state to true when the process starts
        const data = await uploadToS3(file);

        if (!data?.file_key || !data.file_name) {
          toast.error("Something went wrong during upload");
          setUploading(false); 
          return;
        }

        mutate(data, {
          onSuccess: ({ chat_id }) => {
            toast.success("Chat created!");
            router.push(`/chat/${chat_id}`);
          },
          onError: (err) => {
            toast.error("Error creating chat");
            console.error(err);
          },
          onSettled: () => {
            setUploading(false); // Ensure the state resets after the mutation
          },
        });
      } catch (error) {
        console.error("Upload error:", error);
        toast.error("Upload failed");
      } finally {
        // Do not reset uploading here to ensure the mutation completes first
      }
    },
  });

  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        {...getRootProps({
          className:
            "border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col",
        })}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <>
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">
            Analyzing your file...
            </p>
            <p className="mt-2 text-sm text-slate-400">
              You will directed to chats soon ...
            </p>
          </>
        ) : (
          <>
            <Inbox className="w-10 h-10 text-blue-500" />
            <p className="mt-2 text-sm text-slate-400">Drop PDF Here</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
