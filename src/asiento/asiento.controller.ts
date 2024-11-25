import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, ParseIntPipe, Put } from '@nestjs/common';
import { AsientoService } from './asiento.service';
import { CreateAsientoDto } from './dto/create-asiento.dto';
import { UpdateAsientoDto } from './dto/update-asiento.dto';import { CreateAsientoItemDto } from './dto/create-asiento-item.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Asiento } from './entities/asiento.entity';


@ApiTags('asientos')
@Controller('asientos')
export class AsientoController {
  constructor(private readonly asientoService: AsientoService) {}

  @Get()
  async findAllWithLineItems(): Promise<Asiento[]> {
    return await this.asientoService.findAllWithLineItems();
  }

  @Post()
  async createAsiento(@Body() createAsientoDto: CreateAsientoDto) {
    try {
        const newAsiento = await this.asientoService.createAsientoWithItems(createAsientoDto);
        return {
            message: 'Asiento creado exitosamente',
            data: newAsiento,
        };
    } catch (error) {
        throw new HttpException(
            {
                message: 'Error al crear el asiento',
                error: error.message,
            },
            HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
  }

  @Get(':id')
  async getAsiento(@Param('id', ParseIntPipe) id: number): Promise<Asiento> {
    return this.asientoService.findOneWithItems(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un asiento y sus items' })
  async updateAsiento(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAsientoDto: UpdateAsientoDto,
  ) {
    try {
      const updatedAsiento = await this.asientoService.updateAsiento(id, updateAsientoDto);
      return {
        message: 'Asiento actualizado exitosamente',
        data: updatedAsiento,
      };
    } catch (error) {
      throw new HttpException(
        {
          message: 'Error al actualizar el asiento',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  
  // @Delete(':id')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // @ApiOperation({ summary: 'Eliminar un asiento y sus items' })
  // async deleteAsiento(@Param('id', ParseIntPipe) id: number) {
  //   await this.asientosService.delete(id);
  // }
}
