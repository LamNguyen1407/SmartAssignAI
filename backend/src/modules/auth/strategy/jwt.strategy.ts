import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Lấy token từ cookie thay vì từ header
      jwtFromRequest: (req: Request) => {
        if (req && req.cookies) {
          return req.cookies['accessToken']; 
        }
        return null;
      },
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default_secret',
    });
  }

  // validate() được gọi khi token hợp lệ → req.user = giá trị return ở đây
  async validate(payload: any) {
    return { userId: payload.sub }; // hoặc thêm email, role,... nếu cần
  }
}
