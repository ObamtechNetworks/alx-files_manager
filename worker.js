const Queue = require('bull');

const fileQueue = new Queue('fileQueue');
const { ObjectId } = require('mongodb');
const imageThumbnail = require('image-thumbnail');
const fs = require('fs');
const dbClient = require('./utils/db'); // Assuming dbClient is used to access the database

fileQueue.process(async (job, done) => {
  try {
    const { userId, fileId } = job.data;

    // Check if fileId and userId exist
    if (!fileId) throw new Error('Missing fileId');
    if (!userId) throw new Error('Missing userId');

    const db = dbClient.getDb();

    // Find the file by fileId and userId in the database
    const file = await db.collection('files').findOne({
      _id: ObjectId(fileId),
      userId: ObjectId(userId),
    });

    if (!file) throw new Error('File not found');

    const filePath = file.localPath;

    // Check if the file exists in the local filesystem
    if (!fs.existsSync(filePath)) throw new Error('File does not exist on the server');

    // Define thumbnail sizes
    const sizes = [500, 250, 100];

    // Generate thumbnails concurrently using Promise.all
    await Promise.all(sizes.map(async (size) => {
      const options = { width: size };
      const thumbnail = await imageThumbnail(filePath, options);
      const thumbnailPath = `${filePath}_${size}`;
      fs.writeFileSync(thumbnailPath, thumbnail);
    }));

    done();
  } catch (error) {
    console.error('Error in processing fileQueue:', error);
    done(error);
  }
});
