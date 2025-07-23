import {
  Body,
  Controller,
  Param,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Public } from './decorators/public.decorator';
import { AtGuard } from './guards/at.guard';
import { RtGuard } from './guards/rt.guard';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JWTPayload } from './strategies/at.strategy';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

export interface RequestWithUser extends Request {
  user: {
    sub: string;
    email: string;
    refresh_token: string;
  };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // auth/signup
  @Public()
  @Post('signup')
  async SignUp(@Body() CreateUserDto: CreateUserDto) {
    return await this.authService.signUp(CreateUserDto);
  }

  // auth/signin
  @Public()
  @Post('signin')
  async signIn(@Body() createAuthDto: CreateAuthDto) {
    return await this.authService.signIn(createAuthDto);
  }

  //   auth/signout
  @UseGuards(AtGuard)
  @Post('signout/:id')
  async signOut(@Param('id') id: string) {
    return await this.authService.signOut(id);
  }

  //   auth/refresh/:id
  @Public()
  @UseGuards(RtGuard)
  @Post('refresh/:id')
  async refreshTokens(@Param('id') id: string, @Req() req: Request) {
    // Extract the refresh token from the request
    const user = req.user as JWTPayload;
    if (user?.sub !== id) {
      throw new UnauthorizedException('Invalid user ID');
    }
    const token = req.headers.authorization?.replace('Bearer ', '') || '';
    return await this.authService.refreshTokens(id, token);
  }

  // auth/changePassword
  @Post('change-password/:id')
  async changePassword(
    @Param('id') id: string,
    @Body() body: { oldPassword: string; newPassword: string },
  ) {
    return await this.authService.changePassword(
      id,
      body.oldPassword,
      body.newPassword,
    );
  }

  // auth/reset-email
  @Public()
  @Post('reset-email')
  async resetEmail(@Body('email') email: string) {
    return await this.authService.resetEmail(email);
  }

  // auth/reset-password
  @Public()
  @Post('reset-password/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    return await this.authService.resetPassword(token, newPassword);
  }
}
