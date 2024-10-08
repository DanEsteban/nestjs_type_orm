import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, Matches } from "class-validator";

export class CreateAccountDto {

     @ApiProperty({
          description: 'The code of the accounting plan',
          example: '1., 1.1, 1.1.1., etc',
     })
     @IsString()
     @Matches(/^[0-9.]+$/, { message: 'The code must contain only numbers and dots.' })
     code: string;

     @ApiProperty({
          description: 'The name of the accounting plan',
          example: 'Activo',
     })
     @IsString()
     name: string;

     @ApiProperty({
          description: 'The level of the accounting plan',
          example: '1, 2, 3, etc',
     })
     @IsNumber({}, { message: 'Level must be a number' })
     level: number;

     @ApiPropertyOptional({
          description: 'The ID of the parent accounting plan (if any)',
          example: '1, 1.1, 1.1.1',
     })
     @IsOptional()
     @Matches(/^[0-9.]+$/, { message: 'Parent Code must contain only numbers and dots.' })
     parent_code?: string;

}
