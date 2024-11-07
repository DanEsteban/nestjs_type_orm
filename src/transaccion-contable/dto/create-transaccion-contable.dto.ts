import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, isBoolean, IsNotEmpty, IsNumber, isNumber, IsOptional, IsString, Matches, MinLength } from "class-validator";

export class CreateTransaccionContableDto {

    @ApiProperty({
        description: 'El codigo de la empresa',
        example: '1',
    })
    @IsString()
    @IsOptional()
    codigo_empresa?: string;

    @ApiProperty({
        description: 'El codigo de la transaccion',
        example: 'ABCD',
    })
    @IsNotEmpty()
    @IsString()
    codigo_transaccion: string;

    @ApiProperty({
        description: 'El nombre de la transaccion contable',
        example: 'Asiento de cobros',
    })
    @IsNotEmpty()
    @IsString()
    nombre: string;

    @ApiProperty({
        description: 'El secuencial de la transaccion contable',
        example: '0000001',
    })
    @IsNotEmpty()
    @IsNumber()
    secuencial: number;

    @ApiProperty({
        description: '1 si es creada por default y 0 es creada manualmente(puede eliminar y editar)',
        example: '1',
    })
    @IsNotEmpty()
    @IsBoolean()
    lectura: number;

    @ApiProperty({
        description: '1 campo bloqueado y 0 campo no bloqueado)',
        example: 'true',
    })
    @IsNotEmpty()
    @IsBoolean()
    activo: boolean;


}