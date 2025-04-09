import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateLoginHistoryDto } from './dto/create-login-history.dto';
import { UpdateLoginHistoryDto } from './dto/update-login-history.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginHistory } from './entities/login-history.entity';
import { In, Repository } from 'typeorm';
import { UAParser } from 'ua-parser-js';
import { Request } from 'express';
import { Usuario } from 'src/users/entities/user.entity';

@Injectable()
export class LoginHistoryService {

  constructor(
    @InjectRepository(LoginHistory)
    private readonly loginHistoryRepository: Repository<LoginHistory>,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
  ) { }

  async saveUserLogin(
    request: Request,
    createLoginHistoryDto: CreateLoginHistoryDto,
  ): Promise<LoginHistory> {
    try {
      const ip = this.getClientIp(request);

      const userAgent = request.headers['user-agent'] || 'Unknown';
      const parser = new UAParser(userAgent);

      const browser = parser.getBrowser().name || 'Unknown Browser';

      const osName = parser.getOS().name || 'Unknown OS';
      const osVersion = parser.getOS().version || '';
      const os = `${osName} ${osVersion}`.trim();

      const deviceType = parser.getDevice().type || 'Desktop';

      const location = await this.getLocation(ip);

      const loginEntry = this.loginHistoryRepository.create({
        ip,
        browser,
        os,
        userId: createLoginHistoryDto.userId,
        userName: createLoginHistoryDto.userName,
        deviceType,
        location,
      });

      return await this.loginHistoryRepository.save(loginEntry);
    } catch (error) {
      console.error('Error al guardar login:', error);
      throw new InternalServerErrorException('Error al guardar el login');
    }
  }

  private getClientIp(request: Request): string {
    let ip =
      (request.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      request.socket?.remoteAddress ||
      'IP not found';

    if (ip.startsWith('::ffff:')) {
      ip = ip.slice(7); // Remove "::ffff:" prefix
    }
    return ip;
  }

  private async getLocation(ip: string): Promise<string> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000); // 2 segundos de timeout

      const response = await fetch(`http://ip-api.com/json/${ip}`, {
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const data = await response.json();

      if (data.status === 'success') {
        return `${data.city}, ${data.country}`;
      }
    } catch (error) {
      console.error('Error al obtener ubicación:', error);
    }

    return 'Unknown Location';
  }


  async findLoginHistory(user: Usuario): Promise<LoginHistory[]> {
    if (user.systemRole === 'superadmin') {
      // Superadmin: puede ver TODO
      return this.loginHistoryRepository.find({
        order: { timestamp: 'DESC' },
      });
    }

    const isCompanyAdmin = user.empresas?.some(
      (usuarioEmpresa) => usuarioEmpresa.companyRole === 'admin',
    );

    if (isCompanyAdmin) {
      const usersCreatedByAdmin = await this.usuarioRepository.find({
        select: ['id'],
        where: {
          createdBy: { id: user.id },
        },
      });

      const userIds = usersCreatedByAdmin.map(u => u.id);

      // Agregamos el id del propio admin
      userIds.push(user.id);

      return this.loginHistoryRepository.find({
        where: { userId: In(userIds) },
        order: { timestamp: 'DESC' },
      });

    }

    // Usuario normal: solo su propio historial
    return this.loginHistoryRepository.find({
      where: { userId: user.id },
      order: { timestamp: 'DESC' },
    });
  }

}


///// parte de respaldo para la obtencion de la ip y ubicacion
// async saveUserLogin(
//   request: Request,
//   createLoginHistoryDto: CreateLoginHistoryDto,
// ): Promise<LoginHistory> {

//   try {

//     // Capturar la IP del usuario (considerando proxys)
//     const forwarded = request.headers['x-forwarded-for'] as string;
//     let ip =
//       forwarded?.split(',')[0]?.trim() ||
//       request.socket?.remoteAddress ||
//       'IP not found';

//     // Limpiar IPv6 si viene como "::ffff:192.168.1.10"
//     if (ip?.startsWith('::ffff:')) {
//       ip = ip.replace('::ffff:', '');
//     }

//     // Capturar el User-Agent
//     const userAgent = request.headers['user-agent'] || 'Unknown';

//     // Parsear la información del navegador y SO
//     const parser = new UAParser(userAgent);
//     const browser = parser.getBrowser().name || 'Unknown Browser';
//     const os = `${parser.getOS().name} ${parser.getOS().version}` || 'Unknown OS';
//     const deviceType = parser.getDevice().type || 'Desktop';

//     // -- Obtener la ubicación usando ip-api.com --
//     let location = 'Unknown Location';
//     try {
//       const response = await fetch(`http://ip-api.com/json/${ip}`);
//       const data = await response.json();
//       if (data.status === 'success') {
//         location = `${data.city}, ${data.country}`;
//       }
//     } catch (geoError) {
//       console.error('Error al obtener ubicación:', geoError);
//     }

//     // Crear y guardar el registro
//     const loginEntry = this.loginHistoryRepository.create({
//       ip,
//       browser,
//       os,
//       userId: createLoginHistoryDto.userId,
//       userName: createLoginHistoryDto.userName,
//       deviceType,
//       location
//     });
//     return await this.loginHistoryRepository.save(loginEntry);
//   } catch (error) {
//     throw new InternalServerErrorException('Error al guardar el login');

//   }
// }