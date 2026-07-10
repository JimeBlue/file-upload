declare global {
  namespace Express {
    export interface Request {
      // TODO: narrow this to formidable's File type once cloudUploader is built
      file?: unknown;
    }
  }
}
export {};
