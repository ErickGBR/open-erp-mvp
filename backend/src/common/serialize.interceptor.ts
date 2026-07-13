import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class SerializeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => this.transform(data)),
    );
  }

  private transform(value: any): any {
    if (typeof value === 'string') {
      return this.convertString(value);
    }
    if (Array.isArray(value)) {
      return value.map(item => this.transform(item));
    }
    if (value !== null && typeof value === 'object') {
      const acc: Record<string, any> = {};
      for (const key of Object.keys(value)) {
        acc[key] = this.transform(value[key]);
      }
      return acc;
    }
    return value;
  }

  private convertString(str: string): any {
    // Only convert decimal strings (e.g. "99.99") to numbers — these are
    // PostgreSQL decimal/numeric columns that TypeORM returns as strings.
    // Pure integer strings (e.g. barcodes, SKUs, phone numbers) are left as-is.
    if (/^-?\d+\.\d+$/.test(str)) {
      return Number(str);
    }
    return str;
  }
}
