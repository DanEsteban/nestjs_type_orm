import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateAccountingPlanDto } from './dto/create-accounting-plan.dto';
import { UpdateAccountingPlanDto } from './dto/update-accounting-plan.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountingPlan } from './entities/accounting-plan.entity';
import { TreeRepository } from 'typeorm';

@Injectable()
export class AccountingPlanService {

  constructor(
      @InjectRepository(AccountingPlan)
      private accountRepository: TreeRepository<AccountingPlan>,
  ) { }

  async createAccount(createAccountingPlanDtos: CreateAccountingPlanDto) {
    const { name, code, parentId } = createAccountingPlanDtos;
    
    let parent: AccountingPlan | null = null;
    if (parentId) {
      parent = await this.accountRepository.findOne({ where: { id: parentId } });
      if (!parent) {
        throw new NotFoundException(`Parent account with id ${parentId} not found`);
      }
    }

    const newAccount = this.accountRepository.create({
      name,
      code,
      parent,
    });

    return this.accountRepository.save(newAccount);
  }

  async getAccountTree(): Promise<AccountingPlan[]> {
    return this.accountRepository.findTrees(); // Método de TreeRepository
  }

  async getAccountById(id: number): Promise<AccountingPlan> {
    const account = await this.accountRepository.findOne({ where: { id } });
    if (!account) {
      throw new NotFoundException(`Account with id ${id} not found`);
    }
    return account;
  }

  async updateAccount(id: number, updateAccountingPlanDto: UpdateAccountingPlanDto): Promise<AccountingPlan> {
    const { parentId, name, code } = updateAccountingPlanDto;

    // Obtener la cuenta que se quiere actualizar
    const account = await this.getAccountById(id);

    // Si se quiere cambiar el parentId
    if (parentId !== undefined) {
      // Evitar que una cuenta se convierta en su propio padre
      if (parentId === id) {
        throw new BadRequestException('Una cuenta no puede ser su propio padre');
      }

      const newParent = await this.accountRepository.findOne({ where: { id: parentId } });
      if (!newParent) {
        throw new NotFoundException(`Parent account with id ${parentId} not found`);
      }

      // Asignar el nuevo padre
      account.parent = newParent;
    }

    // Actualizar nombre y código si es necesario
    if (name !== undefined) {
      account.name = name;
    }
    if (code !== undefined) {
      account.code = code;
    }

    // Guardar los cambios en la base de datos
    return this.accountRepository.save(account);
  }

  async deleteAccount(id: number): Promise<boolean> {
    const account = await this.getAccountById(id);
    const result = await this.accountRepository.remove(account);
    return !!result;
  }
}


