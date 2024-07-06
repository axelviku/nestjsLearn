
  import { UtilityService } from 'common/utils/utils.service'
  import { User } from 'common/schemas/user.schema';
  import { InjectModel } from '@nestjs/mongoose';
  import { Model, Types } from 'mongoose';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    @InjectModel(User.name) private readonly authModel: Model<User>,
    private readonly utilityService: UtilityService,
  ) {}
  // constructor(private reflector: Reflector, private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    
    if (!authHeader) {
      return false;
    }
    const user =  this.authModel.findOne({loginToken:authHeader}).lean();
    try {
      request['user'] = user;
      request['user']['isLogin'] = true;
      return true;
    } catch (e) {
      return false;
    }
  }
};