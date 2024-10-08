import { Controller, Get, Post, Body, Patch, Param, Delete, Put, NotFoundException, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { AccountingPlanService } from './accounting-plan.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateAccountDto } from './dto/create-accounting-plan.dto';
import { UpdateAccountDto } from './dto/update-accounting-plan.dto';
import { PaginationDto } from './dto/pagination.dto';
import { AccountingPlan } from './entities/accounting-plan.entity';

@ApiTags('accounts')
@Controller('accounts')
export class AccountingPlanController {
  constructor(private readonly accountingPlanService: AccountingPlanService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Get all accounts successfully.' })
  async findAll(@Query('offset') offset: number = 0, @Query('take') take: number = 10): Promise<AccountingPlan[]> {
    return this.accountingPlanService.findAll(offset, take);
  }
  // async findAll(): Promise<AccountingPlan[]> {
  //   return this.accountingPlanService.findAll();
  // }
  
  @Post()
  @ApiResponse({ status: 201, description: 'Account created successfully.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  @ApiResponse({ status: 409, description: 'Account with this code already exists.' })
  async create(@Body() createAccountDto: CreateAccountDto): Promise<AccountingPlan> {
    return this.accountingPlanService.create(createAccountDto);
  }

  @Put(':id')
  @ApiResponse({ status: 200, description: 'Account updated successfully.' })
  async update(
    @Param('id') id: number,
    @Body() updateAccountDto: Partial<AccountingPlan>,
  ): Promise<AccountingPlan> {
    return this.accountingPlanService.update(id, updateAccountDto);
  }

}

