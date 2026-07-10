import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KardexEntry } from './kardex.entity';
import { KardexController } from './kardex.controller';
import { KardexService } from './kardex.service';

@Module({
  imports: [TypeOrmModule.forFeature([KardexEntry])],
  controllers: [KardexController],
  providers: [KardexService],
  exports: [KardexService],
})
export class KardexModule {}
