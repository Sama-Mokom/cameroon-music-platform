import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      // Debug logging
      console.log('ZodValidationPipe - Received value type:', typeof value);
      console.log('ZodValidationPipe - Received value:', JSON.stringify(value));

      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        // Debug logging for errors
        console.error('ZodValidationPipe - Validation errors:', messages);
        console.error('ZodValidationPipe - Received value was:', JSON.stringify(value));

        throw new BadRequestException({
          message: 'Validation failed',
          errors: messages,
        });
      }
      throw new BadRequestException('Validation failed');
    }
  }
}
