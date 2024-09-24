import { PartialType } from '@nestjs/swagger';
import { CreateAccountingPlanDto } from './create-accounting-plan.dto';
import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateAccountingPlanDto extends PartialType(CreateAccountingPlanDto) {
     @IsOptional()
     @IsString()
     @Length(2, 100, { message: 'El nombre debe tener entre 2 y 100 caracteres' })
     name?: string;

     @IsOptional()
     @IsString()
     @Matches(/^[0-9.]+$/, { message: 'El código debe contener solo números y puntos' })
     @Length(1, 20, { message: 'El código debe tener entre 1 y 20 caracteres' })
     code?: string;

}
