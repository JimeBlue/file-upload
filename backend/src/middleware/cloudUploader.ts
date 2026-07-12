import type { RequestHandler } from 'express';
// v2 is for type module
import { v2 as cloudinary } from 'cloudinary';

const cloudUploader: RequestHandler = async (req, res, next) => {
    // If there's no file to work with, immediately hand the request off to the error handler with a 400 'no file found' error, and return
  if (!req.file) {
    next(new Error('No file found on the request', { cause: { status: 400 } }));
    return;
  }

  try {

    // cloudinary.uploader.upload() is the SDK function that actually sends a file to Cloudinary's servers and stores it there. It takes two arguments:
    // Argument 1 --> req.file.filepath: the path on your local disk where Formidable temporarily saved the uploaded file after parsing it. 
    // Cloudinary's upload() reads the file from that path and sends it up.
    const { secure_url } = await cloudinary.uploader.upload(req.file.filepath, {
        // Argument 2 — an options object telling Cloudinary what kind of asset this is. 
      resource_type: 'image'
    });

    // that takes the Cloudinary URL you just extracted and stores it on req.body under the key image.
    req.body.image = secure_url;

    next();
  } catch (err) {
    next(err);
  }
};

export default cloudUploader;
