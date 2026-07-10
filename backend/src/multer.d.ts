declare module 'multer' {
  import { Request } from 'express';
  interface File {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
  }
  interface Options {
    dest?: string;
    storage?: StorageEngine;
    limits?: { fileSize?: number; files?: number; fields?: number };
    fileFilter?: (req: any, file: File, cb: (error: Error | null, acceptFile: boolean) => void) => void;
  }
  interface StorageEngine {
    _handleFile(req: any, file: File, cb: (error: Error | null, info?: Partial<File>) => void): void;
    _removeFile(req: any, file: File, cb: (error: Error | null) => void): void;
  }
  function diskStorage(opts: {
    destination?: string | ((req: any, file: File, cb: (error: Error | null, destination: string) => void) => void);
    filename?: (req: any, file: File, cb: (error: Error | null, filename: string) => void) => void;
  }): StorageEngine;
  function memoryStorage(): StorageEngine;
  export { diskStorage, memoryStorage, Options, File, StorageEngine };
  export default function multer(options?: Options): any;
}
