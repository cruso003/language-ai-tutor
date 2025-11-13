import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

// Configure Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export interface UploadOptions {
  folder?: string;
  public_id?: string;
  resource_type?: 'auto' | 'image' | 'video' | 'raw';
  transformation?: Array<{
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
  }>;
}

export class FileStorageService {
  /**
   * Upload a file to Cloudinary from a buffer
   */
  async uploadBuffer(
    buffer: Buffer,
    options: UploadOptions = {}
  ): Promise<{ url: string; publicId: string; secureUrl: string }> {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      throw new Error('Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder || 'fluentgym',
          public_id: options.public_id,
          resource_type: options.resource_type || 'auto',
          transformation: options.transformation,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              url: result.url,
              publicId: result.public_id,
              secureUrl: result.secure_url,
            });
          } else {
            reject(new Error('Upload failed without error'));
          }
        }
      );

      uploadStream.end(buffer);
    });
  }

  /**
   * Upload a file to Cloudinary from a base64 string
   */
  async uploadBase64(
    base64Data: string,
    options: UploadOptions = {}
  ): Promise<{ url: string; publicId: string; secureUrl: string }> {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      throw new Error('Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.');
    }

    const result: UploadApiResponse = await cloudinary.uploader.upload(base64Data, {
      folder: options.folder || 'fluentgym',
      public_id: options.public_id,
      resource_type: options.resource_type || 'auto',
      transformation: options.transformation,
    });

    return {
      url: result.url,
      publicId: result.public_id,
      secureUrl: result.secure_url,
    };
  }

  /**
   * Upload audio file (optimized for speech recordings)
   */
  async uploadAudio(
    audioBuffer: Buffer,
    userId: string,
    sessionId?: string
  ): Promise<{ url: string; publicId: string; secureUrl: string }> {
    const timestamp = Date.now();
    const folder = sessionId ? `audio/${userId}/${sessionId}` : `audio/${userId}`;
    
    return this.uploadBuffer(audioBuffer, {
      folder,
      public_id: `recording_${timestamp}`,
      resource_type: 'video', // Cloudinary uses 'video' for audio files
    });
  }

  /**
   * Upload avatar image
   */
  async uploadAvatar(
    imageBuffer: Buffer,
    userId: string
  ): Promise<{ url: string; publicId: string; secureUrl: string }> {
    return this.uploadBuffer(imageBuffer, {
      folder: `avatars/${userId}`,
      public_id: 'avatar',
      resource_type: 'image',
      transformation: [
        {
          width: 512,
          height: 512,
          crop: 'fill',
          quality: 'auto',
        },
      ],
    });
  }

  /**
   * Delete a file from Cloudinary
   */
  async deleteFile(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<void> {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      throw new Error('Cloudinary is not configured');
    }

    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  }

  /**
   * Get optimized URL for an existing file
   */
  getOptimizedUrl(publicId: string, options?: {
    width?: number;
    height?: number;
    quality?: string | number;
    format?: string;
  }): string {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      throw new Error('Cloudinary is not configured');
    }

    return cloudinary.url(publicId, {
      transformation: [
        {
          width: options?.width,
          height: options?.height,
          quality: options?.quality || 'auto',
          fetch_format: options?.format || 'auto',
        },
      ],
    });
  }
}

export const fileStorage = new FileStorageService();
