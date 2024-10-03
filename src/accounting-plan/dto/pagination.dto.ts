import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
     @ApiPropertyOptional({ default: 1 })
     @IsOptional()
     @IsInt()
     @Min(1)
     @Type(() => Number)
     page?: number = 1;

     @ApiPropertyOptional({ default: 10 })
     @IsOptional()
     @IsInt()
     @Min(1)
     @Type(() => Number)
     limit?: number = 10;
}