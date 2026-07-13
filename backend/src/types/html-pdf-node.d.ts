// Type declaration for html-pdf-node (no @types package available)
declare module 'html-pdf-node' {
  interface FileInput {
    content?: string;
    url?: string;
  }
  interface Options {
    format?: string;
    printBackground?: boolean;
    [key: string]: any;
  }
  function generatePdf(file: FileInput, options?: Options): Promise<Buffer>;
  export = { generatePdf };
}
