const multer = require('multer');
const cloudinary = require('./cloudinary');
const { Readable } = require('stream');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

const uploadToCloudinary = (buffer, folder = 'pawmise') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        transformation: [
          { width: 1000, height: 1000, crop: 'limit' },
          { quality: 'auto:good' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    const readableStream = Readable.from(buffer);
    readableStream.pipe(uploadStream);
  });
};

const deleteImage = async (publicId) => {
  try {
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
  }
};

const deleteImages = async (publicIds) => {
  try {
    if (publicIds && publicIds.length > 0) {
      await cloudinary.api.delete_resources(publicIds);
    }
  } catch (error) {
    console.error('Error deleting images from Cloudinary:', error);
  }
};

module.exports = {
  upload,
  uploadToCloudinary,
  deleteImage,
  deleteImages
};
