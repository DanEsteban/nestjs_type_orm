import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, Length, Matches, MinLength } from "class-validator";

export class CreateAccountingPlanDto {

     @ApiProperty({
          description: 'The code of accounting plan',
          example: '1',
     })
     @IsString()
     @Matches(/^[0-9.]+$/, { message: 'El código debe contener solo números y puntos' })
     @Length(1, 20, { message: 'El código debe tener entre 1 y 20 caracteres' })
     code: string;

     @ApiProperty({
          description: 'The name of the accounting plan',
          example: 'Activo',
     })
     @IsString()
     @Length(2, 100, { message: 'El nombre debe tener entre 2 y 100 caracteres' })
     name: string;

     @ApiProperty({
          description: 'The name of the company',
          example: 'UDLA',
     })
     
     @IsString()
     @IsOptional()
     readonly company_code: string;

     @IsOptional()
     @IsNumber()
     parentId?: number;
     
}
