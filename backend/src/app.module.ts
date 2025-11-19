import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ArtistModule } from './modules/artist/artist.module';
import { UploadModule } from './modules/upload/upload.module';
import { AdminModule } from './modules/admin/admin.module';
import { SongsModule } from './modules/songs/songs.module';
import { FingerprintingModule } from './modules/fingerprinting/fingerprinting.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    UsersModule,
    ArtistModule,
    UploadModule,
    AdminModule,
    SongsModule,
    FingerprintingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
