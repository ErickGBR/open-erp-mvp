declare module 'pdfkit' {
  interface PDFDocumentOptions {
    size?: string | [number, number];
    margin?: number;
    [key: string]: any;
  }

  class PDFDocument {
    constructor(options?: PDFDocumentOptions);
    fontSize(size: number): this;
    font(font: string): this;
    text(text: string, ...args: any[]): this;
    moveDown(lines?: number): this;
    moveUp(lines?: number): this;
    moveTo(x: number, y: number): this;
    lineTo(x: number, y: number): this;
    stroke(): this;
    image(path: string, x?: number, y?: number, options?: any): this;
    end(): void;
    pipe(destination: any): this;
    on(event: string, listener: (...args: any[]) => void): this;
    readonly y: number;
    readonly x: number;
  }

  export default PDFDocument;
}
