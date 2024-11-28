import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAsientoDto } from './dto/create-asiento.dto';
// import { UpdateAsientoDto } from './dto/update-asiento.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Asiento } from './entities/asiento.entity';
import { AsientoItem } from './entities/asiento-item.entity';
import { Repository } from 'typeorm';
import { CreateAsientoItemDto } from './dto/create-asiento-item.dto';
import { UpdateAsientoDto } from './dto/update-asiento.dto';

@Injectable()
export class AsientoService {

  constructor(
    @InjectRepository(Asiento)
    private asientoRepository: Repository<Asiento>,

    @InjectRepository(AsientoItem)
    private asientoItemRepository: Repository<AsientoItem>,
  ) { }

  async findAllWithLineItems(): Promise<Asiento[]> {
    return await this.asientoRepository.find({
      relations: ['lineItems'],
      order: {
        id: 'DESC',
      }
    });
  }

  async createAsientoWithItems(createAsientoDto: CreateAsientoDto) {
    const { lineItems, fecha_emision, ...asientoData } = createAsientoDto;

    // Si `fecha_emision` es nulo o indefinido, asigna la fecha actual
    const fechaEmisionFinal = fecha_emision || new Date();

    const asiento = this.asientoRepository.create({
      ...asientoData,
      fecha_emision: fechaEmisionFinal,
    });

    const savedAsiento = await this.asientoRepository.save(asiento);

    const asientoItems = lineItems.map((item) => {
      return this.asientoItemRepository.create({
        ...item,
        asiento: savedAsiento,
      });
    });

    await this.asientoItemRepository.save(asientoItems);

    return savedAsiento;
  }

  async findOneWithItems(id: number): Promise<Asiento> {
    return this.asientoRepository.findOne({
      where: { id },
      relations: ['lineItems']
    });
  }

  async updateAsiento(id: number, updateAsientoDto: UpdateAsientoDto): Promise<Asiento> {
    const asiento = await this.asientoRepository.findOne({
      where: { id },
      relations: ['lineItems'],
    });

    if (!asiento) {
      throw new NotFoundException('Asiento no encontrado');
    }

    // Handle line items
    if (updateAsientoDto.lineItems) {
      // Remove existing line items
      await this.asientoItemRepository.remove(asiento.lineItems);

      //Create new line items
      const newLineItems = await Promise.all(
        updateAsientoDto.lineItems.map(async (item) => {
          if (item.id) {
            // Existing line item
            const existingItem = await this.asientoItemRepository.findOne({
              where: { id: item.id },
            });  
            if (existingItem) {
              return this.asientoItemRepository.save({
                ...existingItem,
                ...item,
                asiento,
              });
            } else {
              throw new NotFoundException(`Item con id ${item.id} no encontrado`);
            }
          } else {
            // New line item
            return this.asientoItemRepository.create({
              ...item,
              asiento,
            });
          }
        })
      );
  
      asiento.lineItems = newLineItems;
    }

    // Update asiento fields with spread operator
    return await this.asientoRepository.save({
      ...asiento,
      ...updateAsientoDto
    });
  }

}
