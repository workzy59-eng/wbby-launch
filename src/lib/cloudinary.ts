
/**
 * Uploads a file to Cloudinary using the unsigned upload preset.
 * 
 * @param file The file to upload
 * @param folder Optional folder name in Cloudinary
 * @returns The secure URL of the uploaded file
 */
export const uploadToCloudinary = async (file: File, folder: string = 'uploads'): Promise<string> => {
  const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    console.error("Cloudinary configuration missing. Falling back to base64 or throwing error.");
    // In a real app, you'd want to handle this gracefully or ensure env vars are set.
    throw new Error("Cloudinary configuration missing. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error?.message || "Upload failed");
    }

    const data = await res.json();
    return data.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
};
