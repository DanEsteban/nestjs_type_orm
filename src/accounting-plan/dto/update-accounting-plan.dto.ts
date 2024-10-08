import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateAccountDto } from './create-accounting-plan.dto';

export class UpdateAccountDto extends PartialType(CreateAccountDto) {

     @ApiPropertyOptional({
          description: 'The code of the accounting plan (optional)',
          example: '1.1.1',
     })
     code?: string;

     @ApiPropertyOptional({
          description: 'The name of the accounting plan (optional)',
          example: 'Activo',
     })
     name?: string;

     @ApiPropertyOptional({
          description: 'The level of the accounting plan (optional)',
          example: '2',
     })
     level?: number;

     @ApiPropertyOptional({
          description: 'The ID of the parent accounting plan (optional)',
          example: '1.1',
     })
     parent_code?: string;
}


