import { google, type drive_v3 } from 'googleapis';
import { Readable } from 'stream';

type DriveCtx = {
  drive: drive_v3.Drive;
  imagesFolderId: string;
};

let cachedCtx: DriveCtx | null = null;

function getDriveCtx(): DriveCtx {
  if (cachedCtx) return cachedCtx;

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;
  const imagesFolderId = process.env.GOOGLE_DRIVE_IMAGES_FOLDER_ID;

  if (!clientId || !clientSecret || !refreshToken || !imagesFolderId) {
    throw new Error(
      'Google Drive image upload is not configured. Missing one of: ' +
        'GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN, GOOGLE_DRIVE_IMAGES_FOLDER_ID'
    );
  }

  const auth = new google.auth.OAuth2(clientId, clientSecret);
  auth.setCredentials({ refresh_token: refreshToken });

  const drive = google.drive({ version: 'v3', auth });

  cachedCtx = { drive, imagesFolderId };
  return cachedCtx;
}

export const imageService = {
  async uploadImage(file: Buffer, filename: string, mimeType: string): Promise<string> {
    const { drive, imagesFolderId } = getDriveCtx();

    try {
      const fileMetadata: drive_v3.Schema$File = {
        name: `${Date.now()}-${filename}`,
        parents: [imagesFolderId],
      };

      const media = {
        mimeType,
        body: Readable.from(file),
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id',
      });

      const fileId = response.data.id;
      if (!fileId) throw new Error('Google Drive did not return a file id');

      // Make the file publicly accessible
      await drive.permissions.create({
        fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      // Return a direct view link
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  },

  async deleteImage(fileId: string): Promise<boolean> {
    const { drive } = getDriveCtx();

    try {
      await drive.files.delete({ fileId });
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  },
};
