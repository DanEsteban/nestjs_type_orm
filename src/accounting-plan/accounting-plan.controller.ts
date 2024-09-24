import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { AccountingPlanService } from './accounting-plan.service';
import { CreateAccountingPlanDto } from './dto/create-accounting-plan.dto';
import { UpdateAccountingPlanDto } from './dto/update-accounting-plan.dto';
import { ApiTags } from '@nestjs/swagger';
import { AccountingPlan } from './entities/accounting-plan.entity';

@ApiTags('accounting')
@Controller('accounting-plan')
export class AccountingPlanController {
  constructor(private readonly accountingPlanService: AccountingPlanService) {}

  @Post()
  async createAccount(@Body() createAccountDto: CreateAccountingPlanDto): Promise<AccountingPlan> {
    return this.accountingPlanService.createAccount(createAccountDto);
  }

  @Get()
  async getAccountTree(): Promise<AccountingPlan[]> {
    return this.accountingPlanService.getAccountTree();
  }

  @Get(':id')
  async getAccount(@Param('id') id: number): Promise<AccountingPlan> {
    return this.accountingPlanService.getAccountById(id);
  }

  @Put(':id')
  async updateAccount(
    @Param('id') id: number,
    @Body() updateAccountDto: UpdateAccountingPlanDto
  ): Promise<AccountingPlan> {
    return this.accountingPlanService.updateAccount(id, updateAccountDto);
  }

  @Delete(':id')
  async deleteAccount(@Param('id') id: number): Promise<boolean> {
    return this.accountingPlanService.deleteAccount(id);
  } 
}

