const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
  keyFilename: process.env.GOOGLE_CLOUD_KEYFILE
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET);

module.exports = { storage, bucket };