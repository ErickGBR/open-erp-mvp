import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class SerializeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => this.convertDecimals(this.toPlain(data))),
    );
  }

  /**
   * Recursively convert class instances to plain objects using class-transformer.
   * This respects @Exclude() / @Expose() decorators on entities.
   */
  private toPlain(value: any): any {
    if (value === null || value === undefined) return value;
    if (typeof value !== 'object') return value;

    // instanceToPlain handles arrays and nested objects recursively
    return instanceToPlain(value, { enableCircularCheck: true });
  }

  /**
   * Traverse a plain object tree to convert decimal strings to numbers.
   * This handles PostgreSQL decimal/numeric columns that TypeORM returns as strings.
   */
  private convertDecimals(value: any): any {
    if (typeof value === 'string') {
      // Only convert decimal strings (e.g. "99.99") — not integers (barcodes, SKUs)
      if (/^-?\d+\.\d+$/.test(value)) {
        return Number(value);
      }
      return value;
    }
    if (Array.isArray(value)) {
      return value.map(item => this.convertDecimals(item));
    }
    if (value !== null && typeof value === 'object') {
      const acc: Record<string, any> = {};
      for (const key of Object.keys(value)) {
        acc[key] = this.convertDecimals((value as Record<string, any>)[key]);
      }
      return acc;
    }
    return value;
  }
}
