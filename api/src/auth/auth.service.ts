import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import * as Bcrypt from 'bcrypt';
import { CreateAuthDto } from './dto/create-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { currentUser } from '../types/jwtUser';
import { createResponse } from 'src/utils/apiResponse';
import { MailService } from 'src/mails/mails.service';
import { Mailer } from 'src/mails/helperEmail';
import { CreateUserDto, Role } from 'src/users/dto/create-user.dto';
import { ActivateUserDto } from './dto/activate-user.dto';

interface decodedToken {
  user_id: string;
  email: string;
}

export interface IActivationToken {
  activationCode: string;
  token: string;
}

interface IUser {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  // token for reset email
  private async createResetToken(user_id: string, email: string) {
    const [token] = await Promise.all([
      this.jwtService.signAsync(
        { user_id, email },
        {
          secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
          expiresIn: this.configService.getOrThrow<string>(
            'JWT_ACCESS_EXPIRATION_TIME',
          ),
        },
      ),
    ]);
    // return the token
    return {
      resetToken: token,
    };
  }

  // verify token
  private async verifyToken(token: string) {
    try {
      // verify the token
      const resetToken: decodedToken = await this.jwtService.verifyAsync(
        token,
        {
          secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        },
      );

      // return the decoded token
      return resetToken;
    } catch (error) {
      console.log('An error occured', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  // create tokens
  private async createTokens(user_id: string, email: string) {
    const [at, rt] = await Promise.all([
      // Generate access token
      this.jwtService.signAsync(
        { sub: user_id, email },
        {
          secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
          expiresIn: this.configService.getOrThrow<string>(
            'JWT_ACCESS_EXPIRATION_TIME',
          ),
        },
      ),

      // generate refresh token
      this.jwtService.signAsync(
        { sub: user_id, email },
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.getOrThrow<string>(
            'JWT_REFRESH_EXPIRATION_TIME',
          ),
        },
      ),
    ]);

    // return the tokens
    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await Bcrypt.genSalt(10);
    return await Bcrypt.hash(password, salt);
  }

  // save refresh token in the database
  private async saveRefreshToken(userId: string, refreshToken: string) {
    // hash the refresh token
    const hashedRefreshToken = await this.hashPassword(refreshToken);

    await this.userRepository.update(userId, {
      refresh_token: hashedRefreshToken,
    });
  }

  // signup
  async signUp(CreateUserDto: CreateUserDto) {
    // check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: CreateUserDto.email },
    });

    if (existingUser) {
      throw new NotFoundException('User already exists');
    }

    const user = {
      first_name: CreateUserDto.first_name,
      last_name: CreateUserDto.last_name,
      email: CreateUserDto.email,
      password: CreateUserDto.password,
      role: CreateUserDto.role,
    };

    const activationToken = this.createVerificationCode(user);
    const activationCode = activationToken.activationCode;

    const mailer = Mailer(this.mailService);
    // send activation email
    await mailer.activationEmail({
      activationCode,
      name: user.first_name,
      email: user.email,
    });

    return createResponse(
      activationToken,
      `Activation code sent to ${user.email}`,
    );
  }

  // create 4 digit verification code
  private createVerificationCode(user: IUser): IActivationToken {
    const activationCode = Math.floor(Math.random() * 9000 + 1000).toString(); // 4-digit code
    const token = this.jwtService.sign(
      { user, activationCode },
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: '5m',
      },
    );
    return { activationCode, token };
  }

  // activate user
  async activateUser(activateUserDto: ActivateUserDto) {
    try {
      // verify the token
      const decoded: { user: IUser; activationCode: string } =
        this.jwtService.verify(activateUserDto.activation_token, {
          secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        });

      if (activateUserDto.activation_code !== decoded.activationCode) {
        throw new UnauthorizedException('Invalid activation code');
      }

      // create user
      const newUser = decoded.user;
      const user = this.userRepository.create({
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role as Role,
      });

      await this.userRepository.save(user);

      // send welcome email
      const mailer = Mailer(this.mailService);
      await mailer.welcomeEmail({
        name: user.first_name,
        email: user.email,
      });

      return createResponse(user, 'User created successfully');
    } catch (error) {
      console.error('Activation error:', error);
      throw new UnauthorizedException('Invalid or expired activation token');
    }
  }

  // sign in users
  async signIn(CreateAuthDto: CreateAuthDto) {
    // Find user by email
    const user = await this.userRepository.findOne({
      where: { email: CreateAuthDto.email },
      select: ['user_id', 'email', 'password', 'role'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // compare passwords
    const isPasswordValid = await user.validatePassword(CreateAuthDto.password);
    if (!isPasswordValid) {
      throw new NotFoundException('Invalid Credentials');
    }

    // create tokens
    const { access_token, refresh_token } = await this.createTokens(
      user.user_id,
      user.email,
    );

    // save refresh token in the database
    await this.saveRefreshToken(user.user_id, refresh_token);

    const res = {
      tokens: {
        access_token,
        refresh_token,
      },
      user: {
        userId: user.user_id,
        role: user.role,
      },
    };

    // return tokens
    return createResponse(res, 'User signed in successfully');
  }

  // sign out users
  async signOut(user_id: string) {
    // refresh token to null
    const res = await this.userRepository.update(user_id, {
      refresh_token: () => 'NULL',
    });

    if (res.affected === 0) {
      throw new NotFoundException('User not found');
    }

    return { message: 'User signed out successfully' };
  }

  // refresh tokens
  async refreshTokens(user_id: string, refreshToken: string) {
    // find user by id
    const user = await this.userRepository.findOne({
      where: { user_id: user_id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // check if refresh token is valid
    if (!user.refresh_token) {
      throw new NotFoundException('Refresh token not found');
    }
    console.log('refresh-token [unhashed]', refreshToken);
    console.log('refresh-token[hashed]', user.refresh_token);
    const isRefreshTokenValid = await Bcrypt.compare(
      refreshToken,
      user.refresh_token,
    );

    console.log('is match', isRefreshTokenValid);
    if (!isRefreshTokenValid) {
      throw new NotFoundException('Invalid refresh token');
    }

    // generate new tokens
    const { access_token } = await this.createTokens(user.user_id, user.email);

    return { access_token };
  }

  // validate user
  async validateJwtUser(user_id: string) {
    const user = await this.userRepository.findOne({
      where: { user_id: user_id },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const currentUser: currentUser = { id: user.user_id, role: user.role };

    return currentUser;
  }

  // change password
  async changePassword(
    user_id: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.userRepository.findOne({
      where: { user_id: user_id },
      select: ['user_id', 'password'],
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // validate the old password
    const isValid = await user.validatePassword(oldPassword);
    if (!isValid) {
      throw new UnauthorizedException('Incorrect password');
    }

    // save password
    user.password = newPassword;
    await this.userRepository.save(user);

    return { message: 'Password changed successfuly' };
  }

  // reset email
  async resetEmail(email: string) {
    // find user by email
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['user_id', 'email'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // create token with user id and email
    const { resetToken } = await this.createResetToken(
      user.user_id,
      user.email,
    );

    // send email with reset link
    const mail = Mailer(this.mailService);
    await mail.passwordResetEmail({
      name: user.email,
      email: user.email,
      resetLink: `${this.configService.getOrThrow<string>('FRONTEND_URL')}/reset-password?token=${resetToken}`,
    });

    return createResponse(resetToken, 'Reset email sent successfully');
  }

  // reset password
  async resetPassword(token: string, newPassword: string) {
    // verify the token
    const res = await this.verifyToken(token);
    const user = await this.userRepository.findOne({
      where: { user_id: res.user_id, email: res.email },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // hash the new password
    const hashedPassword = await this.hashPassword(newPassword);

    // query builder to bypass entity hooks
    await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ password: hashedPassword })
      .where('user_id = :userId', { userId: user.user_id })
      .execute();

    return {
      message: `Password reset successful for ${user.email}`,
    };
  }
}
