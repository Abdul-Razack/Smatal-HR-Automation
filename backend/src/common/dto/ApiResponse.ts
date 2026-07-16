import { ApiProperty } from '@nestjs/swagger';

export class ApiResponse<T> {
  @ApiProperty({
    description: 'Indicates if the request was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'The payload returned by the API',
    required: false,
  })
  data?: T;

  @ApiProperty({
    description: 'Additional metadata for the response',
    required: false,
  })
  metadata?: any;

  constructor(success: boolean, data?: T, metadata?: any) {
    this.success = success;
    this.data = data;
    this.metadata = metadata;
  }

  static success<T>(data: T, metadata?: any): ApiResponse<T> {
    return new ApiResponse(true, data, metadata);
  }

  static failure(metadata?: any): ApiResponse<null> {
    return new ApiResponse(false, null as any, metadata);
  }
}
