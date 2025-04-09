import { Module } from '@nestjs/common';
import { LoginHistoryService } from './login-history.service';
import { LoginHistoryController } from './login-history.controller';
import { LoginHistory } from './entities/login-history.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LoginHistory, Usuario])],
  controllers: [LoginHistoryController],
  providers: [LoginHistoryService],
})
export class LoginHistoryModule {}

