import { Injectable } from '@nestjs/common';

@Injectable()
export class UniqueNumberGenerator {
  /**
   * Generates a unique prescription number
   * Format: #ED499EF (# + 6 random alphanumeric characters)
   */
  generatePrescriptionNumber(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '#';

    for (let i = 0; i < 6; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }

    return result;
  }

  /**
   * Generates a unique order number
   * Format: ORD-20250107-A1B2C3 (ORD + date + 6 random chars)
   */
  generateOrderNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomPart = '';

    for (let i = 0; i < 6; i++) {
      randomPart += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }

    return `ORD-${dateStr}-${randomPart}`;
  }

  /**
   * Generates order number from prescription
   * Format: ORD-PRESC-ED499EF-A1B2C3
   */
  generateOrderNumberFromPrescription(prescriptionNumber: string): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomPart = '';

    for (let i = 0; i < 6; i++) {
      randomPart += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }

    // Remove # from prescription number
    const cleanPrescNumber = prescriptionNumber.replace('#', '');
    return `ORD-PRESC-${cleanPrescNumber}-${randomPart}`;
  }
}
