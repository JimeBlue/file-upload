import formidable from 'formidable';
import type { RequestHandler } from 'express';

// docs i used
// https://github.com/node-formidable/formidable#with-expressjs
// https://github.com/node-formidable/formidable?tab=readme-ov-file#options

// Create the function, telling TypeScript it must conform to Express's RequestHandler shape, 
// and assign it an async function that Express will call with (req, res, next) every time a matching request comes in.
const formMiddleware: RequestHandler = async (req, res, next) => {

// creates a parser instance and assignes it form
  const form = formidable({
    // rejects the upload if more than 1 file is sent.
    maxFiles: 1,
    // rejects files biggers than 5MB
    maxFileSize: 5 * 1024 * 1024,
    // only lets image files through the upload — anything else (a PDF, a video, etc.) gets rejected.
    filter: ({ mimetype }) => Boolean(mimetype && mimetype.startsWith('image/')),
    // It renames every uploaded file by sticking the current timestamp in front of its original name (e.g. 1783843200000-profile.jpg), 
    // so two different uploads never overwrite each other by having the same filename.
    filename: (_name, _ext, part) => `${Date.now()}-${part.originalFilename}`
  });

  try {
    // wait for Formidable to parse the multipart request into text fields and uploaded files
    const [fields, files] = await form.parse(req);


    // Formidable gives me fields where every value is wrapped in an array — e.g. { firstName: ['Jane'], email: ['jane@example.com'] }, even though each field only has one value.
    // Unwrap every field's single-item array down to just the value itself, and rebuild the whole fields object that way, then assign it to req.body
    req.body = Object.fromEntries(
      Object.entries(fields).map(([key, value]) => [key, value?.[0]])
    );

    // files.image is Formidable's array of uploaded files for the input named image (remember the frontend keeps that field named image per the README). 
    // Since you set maxFiles: 1, there's at most one file in that array.
    // files.image?.[0] grabs that first (and only) file. The ?. is the safe-access guard again 
    // — if no file was actually uploaded, files.image would be undefined, and undefined?.[0] just quietly returns undefined instead of crashing the server by trying to index into something that doesn't exist.
    req.file = files.image?.[0];

    next();
  } catch (err) {
    next(err);
  }
};

export default formMiddleware;


