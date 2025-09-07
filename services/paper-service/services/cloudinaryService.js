// services/cloudinaryService.js
const cloudinary = require('../config/cloudinary');

async function uploadPDFFromBuffer(fileBuffer, fileName) {
  return new Promise((resolve, reject) => {
    const publicId = (fileName || 'file.pdf').replace(/\.[^/.]+$/, "");

    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw', // important for PDFs
        public_id: publicId,
        type: 'authenticated', // optional, make public/private as needed
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    stream.end(fileBuffer);
  });
}

module.exports = { uploadPDFFromBuffer };
