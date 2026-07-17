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
   *
   * NOTE: instanceToPlain can corrupt Date objects (converts them to {}).
   * We serialize Date objects to ISO strings in a post-processing step.
   */
  private toPlain(value: any): any {
    if (value === null || value === undefined) return value;
    if (typeof value !== 'object') return value;
    if (value instanceof Date) return value.toISOString();
    if (Array.isArray(value)) return value.map((v) => this.toPlain(v));

    // instanceToPlain applies @Exclude/@Expose decorators
    const result = instanceToPlain(value, { enableCircularCheck: true });
    // Post-process: serialize any Date objects that instanceToPlain didn't handle
    return this.serializeDates(result);
  }

  /**
   * Recursively walk an object tree and convert any Date instances to ISO strings.
   * This works around a class-transformer bug where instanceToPlain converts Date to {}.
   */
  private serializeDates(value: any): any {
    if (value === null || value === undefined) return value;
    if (typeof value !== 'object') return value;
    if (value instanceof Date) return value.toISOString();
    if (Array.isArray(value)) return value.map((v) => this.serializeDates(v));

    const result: Record<string, any> = {};
    for (const key of Object.keys(value)) {
      result[key] = this.serializeDates((value as Record<string, any>)[key]);
    }
    return result;
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
