import fs from 'fs';
import { GCP_KEYFILE_OUTPUT_PATH } from '../constants';

const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const encodedKey = process.env.ENCODED_GOOGLE_APPLICATION_CREDENTIALS;

export const loadGcpKey = () => {
  if (!credentialsPath && encodedKey) {
    info(`
    GOOGLE_APPLICATION_CREDENTIALS not set.
    Writing key file....\n\n`);

    const buffer = Buffer.from(encodedKey, 'base64');
    const decodedKey = buffer.toString('utf8');
    fs.writeFileSync(GCP_KEYFILE_OUTPUT_PATH, decodedKey, 'utf8');
    process.env.GOOGLE_APPLICATION_CREDENTIALS = GCP_KEYFILE_OUTPUT_PATH;

    info(`
    Successfully wrote gcp key file.
    Using GOOGLE_APPLICATION_CREDENTIALS=${process.env.GOOGLE_APPLICATION_CREDENTIALS}\n\n`);
  } else if (credentialsPath) {
    info(`
    GOOGLE_APPLICATION_CREDENTIALS is set.
    Using GOOGLE_APPLICATION_CREDENTIALS=${credentialsPath}\n\n`);
  } else {
    console.error('Unable to determine GCP credentials.  Exiting...');
    process.exit(1);
  }
};

const info = (message: string) => {
  return console.log(('' + message).replace(/(\n)\s+/g, '$1'));
};
