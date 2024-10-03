import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { AccountingPlan } from './entities/accounting-plan.entity';
import { CreateAccountDto } from './dto/create-accounting-plan.dto';
import { UpdateAccountDto } from './dto/update-accounting-plan.dto';
import { Repository } from 'typeorm';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class AccountingPlanService {

  constructor(
      @InjectRepository(AccountingPlan)
      private accountRepository: Repository<AccountingPlan>,
  ) { }

  // async findAll(paginationDto: PaginationDto): Promise<{ data: AccountingPlan[]; total: number; page: number; limit: number }> {
  //   const { page, limit } = paginationDto;
  //   const [data, total] = await this.accountRepository.findAndCount({
  //     relations: ['parent', 'children'],
  //     skip: (page - 1) * limit,
  //     take: limit,
  //   });
  //   return { data, total, page, limit };
  // }

  async findAll(): Promise<AccountingPlan[]> {
    return this.accountRepository.find();
  }

  async create(accountDto: CreateAccountDto): Promise<AccountingPlan> {
    const newAccount = this.accountRepository.create(accountDto); // Creamos la nueva cuenta desde el DTO
    return this.accountRepository.save(newAccount); // Guardamos la nueva cuenta
  }

}


