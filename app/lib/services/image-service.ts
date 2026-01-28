import { google } from 'googleapis';
import { Readable } from 'stream';

if (
  !process.env.GOOGLE_OAUTH_CLIENT_ID ||
  !process.env.GOOGLE_OAUTH_CLIENT_SECRET ||
  !process.env.GOOGLE_OAUTH_REFRESH_TOKEN ||
  !process.env.GOOGLE_DRIVE_IMAGES_FOLDER_ID // Add this to .env
) {
  throw new Error("Missing Google Drive environment variables");
}

const auth = new google.auth.OAuth2(
  process.env.GOOGLE_OAUTH_CLIENT_ID,
  process.env.GOOGLE_OAUTH_CLIENT_SECRET
);

auth.setCredentials({
  refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
});

const drive = google.drive({
  version: "v3",
  auth,
});

export const imageService = {
  async uploadImage(file: Buffer, filename: string, mimeType: string): Promise<string> {
    try {
      const fileMetadata = {
        name: `${Date.now()}-${filename}`,
        parents: [process.env.GOOGLE_DRIVE_IMAGES_FOLDER_ID!],
      };

      const media = {
        mimeType: mimeType,
        body: Readable.from(file),
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink, webContentLink',
      });

      const fileId = response.data.id;

      // Make the file publicly accessible
      await drive.permissions.create({
        fileId: fileId!,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      // Return the direct link
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image');
    }
  },

  async deleteImage(fileId: string): Promise<boolean> {
    try {
      await drive.files.delete({ fileId });
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  },
};