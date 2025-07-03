import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pharmacy } from './entities/pharmacy.entity';
import { CreatePharmacyDto } from './dto/create-pharmacy.dto';
import { UpdatePharmacyDto } from './dto/update-pharmacy.dto';
import { ApiResponse, createResponse } from 'src/utils/apiResponse';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/users/dto/create-user.dto';

@Injectable()
export class PharmacyService {
  constructor(
    @InjectRepository(Pharmacy)
    private readonly pharmacyRepository: Repository<Pharmacy>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreatePharmacyDto): Promise<ApiResponse<Pharmacy>> {
    const existing = await this.pharmacyRepository.findOne({
      where: { license_number: dto.license_number },
    });

    const user = await this.userRepository.findOne({
      where: { user_id: dto.user_id },
    });

    if (existing) {
      throw new BadRequestException(
        'Pharmacy with this license number already exists',
      );
    }

    if (!user || user.role !== Role.PHARMACY) {
      throw new BadRequestException('User not found or not a pharmacy');
    }

    const pharmacy = this.pharmacyRepository.create({ ...dto, user });
    const saved = await this.pharmacyRepository.save(pharmacy);

    return createResponse(saved, 'Pharmacy created successfully');
  }

  async findAll(): Promise<ApiResponse<Pharmacy[]>> {
    const pharmacies = await this.pharmacyRepository.find();
    if (pharmacies.length === 0) {
      throw new NotFoundException('No pharmacies found');
    }
    return createResponse(pharmacies, 'Pharmacies retrieved successfully');
  }

  async findOne(id: string): Promise<ApiResponse<Pharmacy | null>> {
    const pharmacy = await this.pharmacyRepository.findOneBy({
      pharmacy_id: id,
    });

    if (!pharmacy) {
      throw new NotFoundException('Pharmacy not found');
    }

    return createResponse(pharmacy, 'Pharmacy retrieved successfully');
  }

  async update(
    id: string,
    dto: UpdatePharmacyDto,
  ): Promise<ApiResponse<Pharmacy | null>> {
    const pharmacy = await this.pharmacyRepository.findOneBy({
      pharmacy_id: id,
    });

    if (!pharmacy) {
      throw new NotFoundException('Pharmacy not found');
    }

    await this.pharmacyRepository.update(id, dto);
    return this.findOne(id)
      .then((updatedPharmacy) => {
        return createResponse(
          updatedPharmacy.data,
          'Pharmacy updated successfully',
        );
      })
      .catch((error) => {
        console.error('Error updating pharmacy:', error);
        throw new BadRequestException('Failed to update pharmacy');
      });
  }

  async remove(id: string): Promise<ApiResponse<null>> {
    const result = await this.pharmacyRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Pharmacy not found');
    }

    return createResponse(null, 'Pharmacy deleted successfully');
  }
}
