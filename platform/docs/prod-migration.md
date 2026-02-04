# Prod Migration (Summary)

Goal: Align Drive + OAuth + Firebase creds with production and verify access.

Steps:

1. Ensure Drive folder ID is correct.
2. Generate refresh token with full Drive scope.
3. Validate Drive access using `debug/drive-check.js`.
4. Update production env values via SOPS.
5. Sync to Vercel and redeploy.

Minimum env keys to update:

- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REFRESH_TOKEN`
- `GOOGLE_DRIVE_FOLDER_ID`
- `GOOGLE_DRIVE_IMAGES_FOLDER_ID`

Verification:

- `node ./debug/drive-check.js` should list folder + `users.json`.
