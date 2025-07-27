import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Stock } from './entities/stocks.entity';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateMedicationDto } from './dto/update-stock.dto';
import { createResponse, ApiResponse } from 'src/utils/apiResponse';

@Injectable()
export class StocksService {
  constructor(
    @InjectRepository(Stock)
    private medicationRepository: Repository<Stock>,
  ) {}

  async create(dto: CreateStockDto): Promise<ApiResponse<Stock>> {
    // Check for duplicate medication code
    const existing = await this.medicationRepository.findOne({
      where: { medication_code: dto.medication_code },
    });

    if (existing) {
      throw new BadRequestException('Medication with this code already exists');
    }

    // Validate input values
    if (dto.stock_quantity < 0) {
      throw new BadRequestException('Stock quantity cannot be negative');
    }

    if (dto.unit_price < 0) {
      throw new BadRequestException('Price cannot be negative');
    }

    // Calculate total price
    const totalPrice = dto.stock_quantity * dto.unit_price;

    // Create and assign total price
    const medication = this.medicationRepository.create({
      ...dto,
      total_price: totalPrice,
    });

    const saved = await this.medicationRepository.save(medication);

    return createResponse(saved, 'Medication created successfully');
  }

  async findAll(): Promise<ApiResponse<Stock[]>> {
    const meds = await this.medicationRepository.find();
    if (meds.length === 0) {
      throw new NotFoundException('Medications not found');
    }
    return createResponse(meds, 'Medications fetched successfully');
  }

  async findOne(id: string): Promise<ApiResponse<Stock | null>> {
    const med = await this.medicationRepository.findOne({
      where: { medication_id: id },
    });

    if (!med) {
      throw new NotFoundException('Medication not found');
    }

    return createResponse(med, 'Medication found');
  }

  async searchByNameFuzzy(q: string): Promise<ApiResponse<Stock[]>> {
    const meds = await this.medicationRepository.find({
      where: { name: ILike(`%${q}%`) },
      take: 20,
    });
    return createResponse(
      meds,
      meds.length ? 'Medications found' : 'No medications found',
    );
  }

  async searchByManufacturerFuzzy(q: string): Promise<ApiResponse<Stock[]>> {
    const meds = await this.medicationRepository.find({
      where: { manufacturer: ILike(`%${q}%`) },
      take: 20,
    });
    return createResponse(
      meds,
      meds.length ? 'Medications found' : 'No medications found',
    );
  }

  async update(
    id: string,
    dto: UpdateMedicationDto,
  ): Promise<ApiResponse<Stock>> {
    const med = await this.medicationRepository.findOne({
      where: { medication_id: id },
    });

    if (!med) {
      throw new NotFoundException('Medication not found');
    }

    const updated = Object.assign(med, dto);
    const saved = await this.medicationRepository.save(updated);

    return createResponse(saved, 'Medication updated successfully');
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    const result = await this.medicationRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Medication not found');
    }

    return createResponse(null, 'Medication deleted successfully');
  }
}
