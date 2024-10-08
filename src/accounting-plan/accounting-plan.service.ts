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

  async findAll(offset: number, take: number): Promise<AccountingPlan[]> {
    const accounts =  await this.accountRepository.find({
      skip: offset,
      take,
    });

    const sortedAccounts = [...accounts].sort((a, b) => {
      const aParts = a.code.split('.').map(Number);  // Convertir cada parte del código a número
      const bParts = b.code.split('.').map(Number);
  
      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        if (aParts[i] !== bParts[i]) {
          return (aParts[i] || 0) - (bParts[i] || 0);  // Comparar parte por parte
        }
      }
      return 0;
    });

    return sortedAccounts;
}


async create(accountDto: CreateAccountDto): Promise<AccountingPlan> {
  const newAccount = this.accountRepository.create(accountDto);
  return this.accountRepository.save(newAccount);
}

async update(id: number, updateAccountDto: Partial<AccountingPlan>): Promise<AccountingPlan> {
  const account = await this.accountRepository.findOne({ where: { id } });
  if (!account) {
    throw new NotFoundException(`Account with id ${id} not found`);
  }
  const updatedAccount = Object.assign(account, updateAccountDto);
  return this.accountRepository.save(updatedAccount);
}

}


