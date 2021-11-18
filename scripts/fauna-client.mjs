import dotenv from 'dotenv';
// Require the driver
import faunadb from 'faunadb';

// Read environment variables from .env file
dotenv.config();

// Acquire the secret and optional endpoint from environment variables
const {
  FAUNA_DOMAIN,
  FAUNA_PORT,
  FAUNA_HTTPS,
  FAUNA_SECRET,
} = process.env;

if (typeof FAUNA_SECRET === 'undefined') {
  throw new Error('FAUNA_SECRET environment variable is missing.');
}

const faunaClient = new faunadb.Client({
  secret: FAUNA_SECRET,
  domain: FAUNA_DOMAIN || 'db.eu.fauna.com',
  port: Number(FAUNA_PORT) || 443,
  scheme: FAUNA_HTTPS === 'false' ? 'http' : 'https',
});

export default faunaClient;
