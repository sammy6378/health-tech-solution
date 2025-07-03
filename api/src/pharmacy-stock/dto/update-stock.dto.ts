import { PartialType } from '@nestjs/swagger';
import { CreateStockDto } from './create-stock.dto';

export class UpdateMedicationDto extends PartialType(CreateStockDto) {}
