import { Controller, Get, Param, ParseIntPipe, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as QRCode from 'qrcode';
import { Employee } from './employee.entity';

@Controller('rh/qr')
export class QrController {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  /**
   * Generate and return a QR code PNG for a given employee.
   * The QR encodes a URL that points to the public marking page.
   */
  @Get(':employeeId')
  async generateQr(
    @Param('employeeId', ParseIntPipe) employeeId: number,
    @Res() res: Response,
  ) {
    const employee = await this.employeeRepository.findOne({ where: { id: employeeId } });
    if (!employee || !employee.qrToken) {
      throw new NotFoundException('Employee not found or has no QR token');
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const markingUrl = `${frontendUrl}/marcar?token=${employee.qrToken}`;

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `inline; filename="qr-${employee.code}.png"`);

    await QRCode.toFileStream(res, markingUrl, {
      type: 'png',
      width: 400,
      margin: 2,
      color: { dark: '#111827', light: '#ffffff' },
    });
  }

  /**
   * Get the QR marking URL for an employee (returns JSON instead of image).
   */
  @Get(':employeeId/url')
  async getQrUrl(
    @Param('employeeId', ParseIntPipe) employeeId: number,
  ) {
    const employee = await this.employeeRepository.findOne({ where: { id: employeeId } });
    if (!employee || !employee.qrToken) {
      throw new NotFoundException('Employee not found or has no QR token');
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return {
      url: `${frontendUrl}/marcar?token=${employee.qrToken}`,
      token: employee.qrToken,
    };
  }

  /**
   * Generate a new QR token for an employee (regenerates existing one).
   */
  @Get(':employeeId/regenerate')
  async regenerateToken(
    @Param('employeeId', ParseIntPipe) employeeId: number,
  ) {
    const employee = await this.employeeRepository.findOne({ where: { id: employeeId } });
    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    const { randomUUID } = await import('crypto');
    employee.qrToken = randomUUID();
    await this.employeeRepository.save(employee);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return {
      url: `${frontendUrl}/marcar?token=${employee.qrToken}`,
      token: employee.qrToken,
    };
  }
}
