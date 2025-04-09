import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, UseGuards } from '@nestjs/common';
import { LoginHistoryService } from './login-history.service';
import { CreateLoginHistoryDto } from './dto/create-login-history.dto';
import { UpdateLoginHistoryDto } from './dto/update-login-history.dto';
import { Request } from 'express';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('login-history')
export class LoginHistoryController {
  constructor(private readonly loginHistoryService: LoginHistoryService) { }

  @Post()
  async saveLogin(
    @Req() request: Request,
    @Body() createLoginHistoryDto: CreateLoginHistoryDto,
  ) {
    return this.loginHistoryService.saveUserLogin(request, createLoginHistoryDto);
  }


  @Get()
  @UseGuards(JwtAuthGuard)
  async findLoginHistory(@Req() request: Request) {
    const user = request['user'];
    return this.loginHistoryService.findLoginHistory(user);
  }

}

