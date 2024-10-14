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
    const accounts = await this.accountRepository.find({
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


  async create(createAccountDto: CreateAccountDto): Promise<AccountingPlan> {

    const { code } = createAccountDto;
    const existingAccount = await this.accountRepository.findOne({ where: { code } });
    if (existingAccount) {
      throw new ConflictException(`Ya existe una cuenta con el código ${code}`);
    }

    const newAccount = this.accountRepository.create(createAccountDto);
    return this.accountRepository.save(newAccount);
  }

  async update(id: number, updateAccountDto: Partial<AccountingPlan>): Promise<AccountingPlan> {
    await this.accountRepository.update(id, updateAccountDto);
    const updatedAccount = await this.accountRepository.findOne({ where: { id } });
    if (!updatedAccount) {
      throw new NotFoundException('Account not found');
    }
    return updatedAccount;
  }

  async delete(id: number): Promise<void> {
    const result = await this.accountRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Account not found');
    }
  }



}


