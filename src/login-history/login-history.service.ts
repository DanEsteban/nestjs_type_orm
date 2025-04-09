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

      // 1. Obtención mejorada de IP
      const getClientIp = (req: Request): string => {
        const headers = req.headers;
        const possibleHeaders = [
          'x-client-ip',
          'x-forwarded-for',
          'cf-connecting-ip', // Cloudflare
          'fastly-client-ip', // Fastly
          'x-real-ip', // Nginx
          'x-cluster-client-ip', // Rackspace LB
          'x-appengine-user-ip', // Google App Engine
        ];

        for (const header of possibleHeaders) {
          const value = headers[header] as string;
          if (value) {
            const ips = value.split(',');
            const cleanIp = ips[0].trim();
            if (cleanIp) return cleanIp;
          }
        }

        return req.socket?.remoteAddress || 'IP not found';
      };

      let ip = getClientIp(request);

      // Limpiar IPv6
      ip = ip.replace(/^::ffff:/, '');

      // 2. Validar IPs no geolocalizables
      const isLocalIp = /^(10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|127\.|::1|fe80::)/i.test(ip);

      // 3. Capturar User-Agent
      const userAgent = request.headers['user-agent'] || 'Unknown';
      const parser = new UAParser(userAgent);
      const browser = parser.getBrowser().name || 'Unknown Browser';
      const os = `${parser.getOS().name || 'Unknown'} ${parser.getOS().version || ''}`.trim();
      const deviceType = parser.getDevice().type || 'Desktop';

      // 4. Obtención de ubicación (con mejor manejo de errores y cache)
      let location = 'Unknown Location';

      if (!isLocalIp) {
        try {
          // Usar HTTPS y manejar timeout
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 3000);

          const response = await fetch(`https://ipapi.co/${ip}/json/`, {
            signal: controller.signal,
          });
          clearTimeout(timeout);

          if (response.ok) {
            const data = await response.json();
            location = [data.city, data.country_name]
              .filter(Boolean)
              .join(', ');
          }
        } catch (geoError) {
          console.error('Error al obtener ubicación:', geoError);
          // Puedes implementar un fallback a otro servicio aquí si quieres
        }
      }

      // 5. Crear y guardar el registro
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
      throw new InternalServerErrorException('Error al guardar el login');

    }
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

      if (userIds.length === 0) {
        return []; // No creó a nadie
      }

      return this.loginHistoryRepository.find({
        where: { userId: In(userIds) },
        order: { timestamp: 'DESC' },
      });
    }
    // if (user.empresas[companyRole] === 'admin') {
    //   // Admin: solo usuarios que el creó
    //   // Tienes que asegurarte que los usuarios tengan registrado quién los creó (por ejemplo, un campo createdByAdminId)
    //   const usersCreatedByAdmin = await this.userRepository.find({
    //     where: { createdByAdminId: user.id },
    //   });
    //   const userIds = usersCreatedByAdmin.map(u => u.id);

    //   if (userIds.length === 0) {
    //     return []; // No creó a nadie
    //   }

    //   return this.loginHistoryRepository.find({
    //     where: { userId: In(userIds) },
    //     order: { timestamp: 'DESC' },
    //   });
    // }

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