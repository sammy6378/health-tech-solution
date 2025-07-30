import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbUrl = configService.get<string>('POSTGRES_URL');
        const isProduction =
          configService.get<string>('NODE_ENV') === 'production';

        return {
          type: 'postgres',
          url: dbUrl,
          entities: [join(process.cwd(), 'dist/**/*.entity.js')],
          synchronize: configService.get('DB_SYNC') === 'true',
          logging: false,
          migrations: [join(process.cwd(), '/../migrations/**/*{.js,ts}')],
          autoLoadEntities: true,
          ssl: isProduction
            ? {
                rejectUnauthorized: false,
                ca: undefined,
                cert: undefined,
                key: undefined,
              }
            : false,
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DbModule {}
