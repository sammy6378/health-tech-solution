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
        const isProduction =
          configService.get<string>('NODE_ENV') === 'production';

        // Use individual PostgreSQL environment variables
        const host = configService.get<string>('PGHOST');
        const username = configService.get<string>('PGUSER');
        const password = configService.get<string>('PGPASSWORD');
        const database = configService.get<string>('PGDATABASE');
        const port = configService.get<number>('PGPORT') || 5432;

        // SSL configuration based on environment
        const sslMode = configService.get<string>('PGSSLMODE');
        // const channelBinding = configService.get<string>('PGCHANNELBINDING');

        let sslConfig: boolean | { rejectUnauthorized: boolean } = false;

        if (isProduction || sslMode === 'require') {
          sslConfig = {
            rejectUnauthorized: false,
          };
        }

        return {
          type: 'postgres',
          host,
          port,
          username,
          password,
          database,
          entities: [join(process.cwd(), 'dist/**/*.entity.js')],
          synchronize: configService.get('DB_SYNC') === 'true',
          logging: false,
          migrations: [join(process.cwd(), '/../migrations/**/*{.js,ts}')],
          autoLoadEntities: true,
          ssl: sslConfig,
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DbModule {}
