import { WarehouseLocation } from '../warehouse-location.entity';
import { Warehouse } from '../warehouse.entity';

export class LocationTreeItemDto {
  id!: number;
  name!: string;
  code!: string | null;

  static fromEntity(loc: WarehouseLocation): LocationTreeItemDto {
    const dto = new LocationTreeItemDto();
    dto.id = loc.id;
    dto.name = loc.name;
    dto.code = loc.section;
    return dto;
  }
}

export class WarehouseTreeItemDto {
  id!: number;
  name!: string;
  country!: string | null;
  city!: string | null;
  locations!: LocationTreeItemDto[];

  static fromEntity(wh: Warehouse): WarehouseTreeItemDto {
    const dto = new WarehouseTreeItemDto();
    dto.id = wh.id;
    dto.name = wh.name;
    dto.country = wh.country;
    dto.city = wh.city;
    dto.locations = (wh.locations || [])
      .filter(loc => loc.isActive)
      .map(LocationTreeItemDto.fromEntity);
    return dto;
  }
}

export class WarehouseTreeResponseDto {
  data!: WarehouseTreeItemDto[];
}
