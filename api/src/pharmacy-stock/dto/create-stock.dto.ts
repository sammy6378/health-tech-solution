import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export enum StockCategory {
  ANTIBIOTIC = 'Antibiotic',
  ANALGESIC = 'Analgesic',
  ANTIHISTAMINE = 'Antihistamine',
  ANTACIDS = 'Antacids',
  ANTIHYPERTENSIVE = 'Antihypertensive',
  ANTIDEPRESSANT = 'Antidepressant',
  ANTIANXIETY = 'Antianxiety',
  ANTIFUNGAL = 'Antifungal',
  ANTIINFLAMMATORY = 'Anti-inflammatory',
  ANTIVIRAL = 'Antiviral',
  PAINRELIEVER = 'Pain Reliever',
  OTHER = 'Other',
}

export enum StockType {
  TABLET = 'Tablet',
  CAPSULE = 'Capsule',
  SYRUP = 'Syrup',
  INJECTION = 'Injection',
  CREAM = 'Cream',
  OINTMENT = 'Ointment',
  PATCH = 'Patch',
  INHALER = 'Inhaler',
  DROPS = 'Drops',
  SUPPOSITORY = 'Suppository',
  OTHER = 'Other',
}

export class CreateStockDto {
  @IsString()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  dosage: string;

  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  side_effects: string[];

  @IsString()
  @IsNotEmpty()
  manufacturer: string;

  @IsString()
  @IsNotEmpty()
  manufacture_date: string;

  @IsDate()
  @IsNotEmpty()
  expiration_date: Date;

  @IsEnum(StockCategory)
  category: StockCategory;

  @IsNotEmpty()
  @IsNumber()
  unit_price: number;

  @IsString()
  @IsNotEmpty()
  medication_code: string;

  @IsEnum(StockType)
  medication_type: StockType;

  @IsString()
  @IsOptional()
  manufacturer_contact?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsNumber()
  @IsNotEmpty()
  stock_quantity: number;

  @IsNumber()
  @IsOptional()
  total_price?: number;

  @IsBoolean()
  @IsNotEmpty()
  prescription_required: boolean;
}
