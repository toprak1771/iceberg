import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AgentsModule } from './agents/agents.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CommissionModule } from './commission/commission.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URL'),
      }),
      inject: [ConfigService],
    }),
    AgentsModule,
    TransactionsModule,
    CommissionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
