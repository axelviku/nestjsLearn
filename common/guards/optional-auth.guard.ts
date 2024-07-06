import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { UtilityService } from 'common/utils/utils.service';
@Injectable()
export class OptionalGuard extends AuthGuard('jwt') {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private readonly utilityService: UtilityService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorizationHeader = request.headers.authorization;
    if (!authorizationHeader) {
      return true;
    }

    const token = this.extractTokenFromHeader(authorizationHeader);
    if (!token) {
      throw new UnauthorizedException();
    }
    
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || '9F*3sE7fN!h#maQrL$tGhW2wA5y^8cYq',
      });

      // const user = await this.utilityService.getUser(payload.sub);

      // if (!user) {
      //   throw new UnauthorizedException();
      // }
      
      // request['user'] = user;
      request['user']['isLogin'] = true;
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(authorizationHeader: string): string | undefined {
    const [type, token] = authorizationHeader?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
