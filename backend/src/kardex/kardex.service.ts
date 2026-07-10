import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { KardexEntry, KardexType, KardexReference } from './kardex.entity';

export interface KardexRecordInput {
  productId: number;
  type: KardexType;
  quantity: number;
  unitCost: number;
  referenceType: KardexReference;
  referenceId?: number | null;
  previousStock: number;
  newStock: number;
  previousAvgCost: number;
  newAvgCost: number;
  notes?: string | null;
}

@Injectable()
export class KardexService {
  constructor(
    @InjectRepository(KardexEntry)
    private readonly kardexRepository: Repository<KardexEntry>,
  ) {}

  async record(input: KardexRecordInput): Promise<KardexEntry> {
    const entry = this.kardexRepository.create({
      productId: input.productId,
      type: input.type,
      quantity: input.quantity,
      unitCost: input.unitCost,
      totalCost: Math.abs(input.quantity) * input.unitCost,
      referenceType: input.referenceType,
      referenceId: input.referenceId ?? null,
      previousStock: input.previousStock,
      newStock: input.newStock,
      previousAvgCost: input.previousAvgCost,
      newAvgCost: input.newAvgCost,
      notes: input.notes ?? null,
    });
    return this.kardexRepository.save(entry);
  }

  async findByProduct(productId: number): Promise<KardexEntry[]> {
    return this.kardexRepository.find({
      where: { productId },
      order: { createdAt: 'ASC' },
    });
  }

  async findByReference(referenceType: KardexReference, referenceId: number): Promise<KardexEntry[]> {
    return this.kardexRepository.find({
      where: { referenceType, referenceId },
    });
  }

  async getCurrentAvgCost(productId: number): Promise<number> {
    const lastEntry = await this.kardexRepository.findOne({
      where: { productId },
      order: { createdAt: 'DESC' },
    });
    return lastEntry ? lastEntry.newAvgCost : 0;
  }
}
