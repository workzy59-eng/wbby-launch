export const CLOUDINARY_UPLOAD_PRESET = 'webbyupload';
export const CLOUDINARY_CLOUD_NAME = 'dlbpgyzyb';
export const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;

export interface CloudinaryResponse {
  secure_url: string;
  resource_type: 'image' | 'video' | 'raw';
  format: string;
  bytes: number;
}

export const uploadToFileService = async (file: File): Promise<string> => {
  // Validation
  const isImage = file.type.startsWith('image/');
  const isAudio = file.type.startsWith('audio/');
  
  if (!isImage && !isAudio) {
    throw new Error('Only image and audio files are allowed.');
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File size must be less than 5MB.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to upload file to Cloudinary');
    }

    const data: CloudinaryResponse = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw error;
  }
};
