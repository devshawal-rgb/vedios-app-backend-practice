import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'vedios-app-bucket';
const publicUrl = (process.env.CLOUDFLARE_R2_PUBLIC_URL || '').replace(/\/$/, '');

// Initialize S3 Client configured for Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: accessKeyId || '',
    secretAccessKey: secretAccessKey || ''
  }
});

/**
 * Upload a file buffer or file path directly to Cloudflare R2
 * @param {Buffer|string} file - Buffer or path of the file
 * @param {string} originalName - Original file name with extension
 * @param {string} mimeType - MIME type of the file (e.g., video/mp4, image/jpeg)
 * @param {string} folder - Destination folder in R2 bucket (e.g., 'videos', 'thumbnails')
 * @returns {Promise<string>} Public CDN URL of the uploaded file
 */
export const uploadToR2 = async (file, originalName, mimeType, folder = 'videos') => {
  try {
    const ext = path.extname(originalName) || (mimeType.startsWith('video') ? '.mp4' : '.jpg');
    const randomHex = crypto.randomBytes(8).toString('hex');
    const key = `${folder}/${Date.now()}-${randomHex}${ext}`;

    let body;
    if (Buffer.isBuffer(file)) {
      body = file;
    } else if (typeof file === 'string' && fs.existsSync(file)) {
      body = fs.readFileSync(file);
    } else {
      throw new Error('Invalid file input for Cloudflare R2 upload');
    }

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: mimeType
    });

    await s3Client.send(command);

    // Clean up local temp file if a filepath was passed
    if (typeof file === 'string' && fs.existsSync(file)) {
      try {
        fs.unlinkSync(file);
      } catch (_) {}
    }

    const finalUrl = `${publicUrl}/${key}`;
    return finalUrl;
  } catch (error) {
    console.error('Cloudflare R2 Upload Error:', error);
    throw new Error(`Failed to upload to Cloudflare R2: ${error.message}`);
  }
};

/**
 * Delete a file from Cloudflare R2 bucket by its public URL
 * @param {string} fileUrl - Public URL of the file to delete
 */
export const deleteFromR2 = async (fileUrl) => {
  try {
    if (!fileUrl || !fileUrl.includes(publicUrl)) return;
    const key = fileUrl.replace(`${publicUrl}/`, '');

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Cloudflare R2 Delete Error:', error);
  }
};
