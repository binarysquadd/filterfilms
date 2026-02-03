import { google } from 'googleapis';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), 'env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const required = [
  'GOOGLE_OAUTH_CLIENT_ID',
  'GOOGLE_OAUTH_CLIENT_SECRET',
  'GOOGLE_OAUTH_REFRESH_TOKEN',
  'GOOGLE_DRIVE_FOLDER_ID',
] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env: ${key}`);
  }
}

const sourceFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID as string;
const backupRootIdEnv = process.env.GOOGLE_DRIVE_BACKUP_FOLDER_ID?.trim();
const backupRootName = process.env.GOOGLE_DRIVE_BACKUP_ROOT_NAME?.trim() || 'filterfilms-backups';
const prefix = process.env.DRIVE_BACKUP_PREFIX?.trim() || 'backup';
const retentionRaw = process.env.DRIVE_BACKUP_RETENTION?.trim();
const retention = retentionRaw ? Number.parseInt(retentionRaw, 10) : undefined;

function timestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}-${pad(
    now.getUTCHours()
  )}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;
}

async function getOrCreateRootFolder(drive: ReturnType<typeof google.drive>) {
  if (backupRootIdEnv) {
    return backupRootIdEnv;
  }

  const sanitizedName = backupRootName.replace(/'/g, "\\'");
  const listRes = await drive.files.list({
    q: `name='${sanitizedName}' and mimeType='application/vnd.google-apps.folder' and trashed=false and 'root' in parents`,
    fields: 'files(id, name)',
    pageSize: 1,
  });

  const existing = listRes.data.files?.[0]?.id;
  if (existing) return existing;

  const created = await drive.files.create({
    requestBody: {
      name: backupRootName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: ['root'],
    },
    fields: 'id',
  });

  const createdId = created.data.id;
  if (!createdId) throw new Error('Failed to create backup root folder');
  return createdId;
}

async function sendDiscordMessage(payload: unknown) {
  if (process.env.NODE_ENV === 'test' || process.env.DRIVE_BACKUP_DISABLE_DISCORD === '1') {
    return;
  }
  const webhook = process.env.DRIVE_DISCORD_WEBHOOK_URL;
  if (!webhook) return;

  const res = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Discord webhook failed: ${res.status}`);
  }
}

async function listBackupFolders(drive: ReturnType<typeof google.drive>, backupRootId: string) {
  const folders: Array<{ id: string; name: string; createdTime?: string }> = [];
  let pageToken: string | undefined;

  do {
    const res = await drive.files.list({
      q: `'${backupRootId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'nextPageToken, files(id, name, createdTime)',
      pageToken,
      pageSize: 1000,
    });

    for (const file of res.data.files ?? []) {
      if (!file.id || !file.name) continue;
      if (!file.name.startsWith(prefix)) continue;
      folders.push({ id: file.id, name: file.name, createdTime: file.createdTime ?? undefined });
    }

    pageToken = res.data.nextPageToken || undefined;
  } while (pageToken);

  return folders;
}

async function enforceRetention(drive: ReturnType<typeof google.drive>, backupRootId: string) {
  if (!retention || Number.isNaN(retention) || retention < 1) return;

  const folders = await listBackupFolders(drive, backupRootId);
  if (folders.length <= retention) return;

  folders.sort((a, b) => {
    const at = a.createdTime ? Date.parse(a.createdTime) : 0;
    const bt = b.createdTime ? Date.parse(b.createdTime) : 0;
    return at - bt;
  });

  const toDelete = folders.slice(0, folders.length - retention);
  for (const folder of toDelete) {
    await drive.files.delete({ fileId: folder.id });
  }

  console.log(`🧹 Retention cleanup: deleted ${toDelete.length} old backups`);
}

async function main() {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET
  );
  auth.setCredentials({ refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN });

  const drive = google.drive({ version: 'v3', auth });

  const backupRootId = await getOrCreateRootFolder(drive);
  const backupFolderName = `${prefix}-${timestamp()}`;
  console.log(`Creating backup folder: ${backupFolderName}`);

  const created = await drive.files.create({
    requestBody: {
      name: backupFolderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [backupRootId],
    },
    fields: 'id',
  });

  const backupFolderId = created.data.id;
  if (!backupFolderId) throw new Error('Failed to create backup folder');

  console.log(`Backup folder ID: ${backupFolderId}`);

  let pageToken: string | undefined;
  let copied = 0;
  let skipped = 0;

  do {
    const res = await drive.files.list({
      q: `'${sourceFolderId}' in parents and trashed=false`,
      fields: 'nextPageToken, files(id, name, mimeType)',
      pageToken,
      pageSize: 1000,
    });

    const files = res.data.files ?? [];

    for (const file of files) {
      if (!file.id || !file.name) continue;
      if (file.mimeType === 'application/vnd.google-apps.folder') {
        skipped++;
        continue;
      }
      await drive.files.copy({
        fileId: file.id,
        requestBody: {
          name: file.name,
          parents: [backupFolderId],
        },
      });
      copied++;
    }

    pageToken = res.data.nextPageToken || undefined;
  } while (pageToken);

  await enforceRetention(drive, backupRootId);

  const backupUrl = `https://drive.google.com/drive/folders/${backupFolderId}`;
  console.log(`✅ Backup complete. Copied: ${copied}, Skipped folders: ${skipped}`);
  console.log(`🔗 ${backupUrl}`);

  const payload = {
    embeds: [
      {
        title: 'Drive Backup Complete',
        description: `Folder: ${backupFolderName}`,
        color: 0x22c55e,
        fields: [
          { name: 'Copied', value: String(copied), inline: true },
          { name: 'Skipped (folders)', value: String(skipped), inline: true },
          { name: 'Backup URL', value: backupUrl, inline: false },
        ],
      },
    ],
  };

  await sendDiscordMessage(payload);
}

main().catch((err) => {
  console.error('❌ drive-backup failed', err);
  if (process.env.NODE_ENV !== 'test') {
    process.exit(1);
  }
});
