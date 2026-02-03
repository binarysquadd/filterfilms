import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const envTest = path.resolve(process.cwd(), '.env.test');
if (fs.existsSync(envTest)) {
  dotenv.config({ path: envTest });
}
