import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const logger = new Logger('DatabaseModule');

        try {
          const config: TypeOrmModuleOptions = {
            type: 'postgres',
            url: configService.getOrThrow<string>('DATABASE_URL'),
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            synchronize: configService.get<boolean>('DB_SYNC', true),
            logging: configService.get<boolean>('DB_LOGGING', false),
            ssl: {
              rejectUnauthorized: false,
            },
          };
          logger.log('Successfully loaded database config');

          return config;
        } catch (error) {
          logger.error(
            'Failed to load database config or connect to the database',
            error,
          );
          throw error;
        }
      },
    }),
  ],
})
export class DbModule {}
