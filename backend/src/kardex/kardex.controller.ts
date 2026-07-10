import { Controller, Get, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { KardexService } from './kardex.service';

@Controller('kardex')
@UseGuards(JwtAuthGuard)
export class KardexController {
  constructor(private readonly kardexService: KardexService) {}

  @Get('product/:productId')
  findByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.kardexService.findByProduct(productId);
  }

  @Get('product/:productId/avg-cost')
  getAvgCost(@Param('productId', ParseIntPipe) productId: number) {
    return this.kardexService.getCurrentAvgCost(productId).then(cost => ({ avgCost: cost }));
  }
}
