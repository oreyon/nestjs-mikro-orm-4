import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContactRequest {
  @ApiProperty({
    description: 'First name of the contact',
    format: 'text',
    example: 'John',
  })
  firstName: string;

  @ApiPropertyOptional({
    description: 'Last name of the contact',
    format: 'text',
    example: 'Doe',
  })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Email of the contact',
    format: 'email',
    example: 'example@example.com',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number of the contact',
    format: 'text',
    example: '08123456789',
  })
  phone?: string;
}

export class CreateContactResponse {
  id: number;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export class GetContactResponse {
  id: number;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export class UpdateContactReq {
  @ApiProperty({
    description: 'Contact ID',
    format: 'number',
    example: 1,
  })
  id: number;

  @ApiPropertyOptional({
    description: 'First name of the contact',
    format: 'text',
    example: 'John',
  })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name of the contact',
    format: 'text',
    example: 'Doe',
  })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Email of the contact',
    format: 'email',
    example: 'updateexample@example.com',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number of the contact',
    format: 'text',
    example: '08123456789',
  })
  phone?: string;
}

export class UpdateContactRes {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export class SearchContactReq {
  username?: string;
  email?: string;
  phone?: string;
  page: number;
  size: number;
}

export class SearchContactRes {
  id: number;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
}
