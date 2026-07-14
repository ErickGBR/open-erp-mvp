import { Injectable, Logger } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { PayrollDetail } from './payroll-detail.entity';
import { PayrollPeriod } from './payroll-period.entity';

interface CompanyInfo {
  name: string;
  nit: string;
  nrc: string | null;
  logoUrl: string | null;
}

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  async generatePayslip(
    detail: PayrollDetail,
    period: PayrollPeriod,
    employeeName: string,
    employeeCode: string,
    employeeDui: string,
    employeeNit: string,
    employeeDepartment: string,
    company: CompanyInfo,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'letter', margin: 40 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // -- Company header --
      const isValidLogoUrl = (url: string | null): boolean => {
        if (!url) return false;
        try {
          const parsed = new URL(url);
          return parsed.protocol === 'https:' && /\.(png|jpg|jpeg|gif|webp)$/i.test(parsed.pathname);
        } catch {
          return false;
        }
      };

      if (company.logoUrl && isValidLogoUrl(company.logoUrl)) {
        // Attempt to include logo if available
        try {
          doc.image(company.logoUrl, 40, 30, { width: 80 });
        } catch {
          this.logger.warn(`Failed to load company logo from: ${company.logoUrl}`);
        }
      } else if (company.logoUrl) {
        this.logger.warn(`Invalid or non-HTTPS logo URL skipped: ${company.logoUrl}`);
      }

      doc.fontSize(16).font('Helvetica-Bold').text(company.name, { align: 'center' });
      doc.fontSize(9).font('Helvetica');
      doc.text(`NIT: ${company.nit}${company.nrc ? `  |  NRC: ${company.nrc}` : ''}`, { align: 'center' });
      doc.moveDown(0.5);

      // Separator
      doc.moveTo(40, doc.y).lineTo(552, doc.y).stroke();
      doc.moveDown();

      // -- Title --
      doc.fontSize(14).font('Helvetica-Bold').text('COMPROBANTE DE PAGO / PAYSLIP', { align: 'center' });
      doc.moveDown();

      // -- Period --
      doc.fontSize(11).font('Helvetica-Bold').text(`Período: ${period.periodName}`, { align: 'center' });
      doc.fontSize(9).font('Helvetica').text(`${period.startDate} al ${period.endDate}`, { align: 'center' });
      doc.moveDown();

      // -- Employee info --
      doc.fontSize(10).font('Helvetica-Bold').text('DATOS DEL EMPLEADO');
      doc.fontSize(9).font('Helvetica');
      doc.text(`Nombre: ${employeeName}`);
      doc.text(`Código: ${employeeCode}`);
      doc.text(`DUI: ${employeeDui}`);
      doc.text(`NIT: ${employeeNit}`);
      doc.text(`Departamento: ${employeeDepartment}`);
      doc.moveDown();

      // -- Payroll table --
      const leftX = 40;
      const rightX = 300;
      const col2X = 450;
      const lineHeight = 18;

      doc.fontSize(10).font('Helvetica-Bold').text('DETALLE DE PAGO');
      doc.moveDown(0.3);

      let y = doc.y;

      const drawRow = (label: string, value: string, bold = false) => {
        doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9);
        doc.text(label, leftX, y, { width: 250 });
        doc.text(value, col2X, y, { width: 80, align: 'right' });
        y += lineHeight;
      };

      drawRow('Salario Base', `$${Number(detail.baseSalary).toFixed(2)}`);
      if (detail.regularHours > 0) {
        drawRow(`Horas Regulares`, `${detail.regularHours} hrs`);
      }
      if (detail.overtimeHours > 0) {
        drawRow(`Horas Extras (×1.5)`, `${detail.overtimeHours} hrs`);
        drawRow('Pago Horas Extras', `$${Number(detail.overtimePay).toFixed(2)}`);
      }
      if (detail.bonuses > 0) {
        drawRow('Bonos', `$${Number(detail.bonuses).toFixed(2)}`);
      }
      if (detail.commissions > 0) {
        drawRow('Comisiones', `$${Number(detail.commissions).toFixed(2)}`);
      }

      // Separator before gross
      doc.moveTo(leftX, y).lineTo(552, y).stroke();
      y += 4;

      drawRow('SUELDO BRUTO', `$${Number(detail.grossPay).toFixed(2)}`, true);

      doc.moveTo(leftX, y).lineTo(552, y).stroke();
      y += 6;

      doc.fontSize(10).font('Helvetica-Bold').text('DEDUCCIONES');
      y += lineHeight;

      if (detail.isssDeduction > 0) {
        drawRow('ISSS (3%)', `$${Number(detail.isssDeduction).toFixed(2)}`);
      }
      if (detail.afpDeduction > 0) {
        drawRow('AFP (7.25%)', `$${Number(detail.afpDeduction).toFixed(2)}`);
      }
      if (detail.isrDeduction > 0) {
        drawRow('ISR', `$${Number(detail.isrDeduction).toFixed(2)}`);
      }
      if (detail.loanDeduction > 0) {
        drawRow('Préstamo/Cuota', `$${Number(detail.loanDeduction).toFixed(2)}`);
      }
      if (detail.otherDeductions > 0) {
        drawRow('Otras Deducciones', `$${Number(detail.otherDeductions).toFixed(2)}`);
      }

      doc.moveTo(leftX, y).lineTo(552, y).stroke();
      y += 4;

      drawRow('TOTAL DEDUCCIONES', `$${Number(detail.totalDeductions).toFixed(2)}`, true);

      doc.moveTo(leftX, y).lineTo(552, y).stroke();
      y += 8;

      // -- Net pay (highlighted) --
      doc.fontSize(14).font('Helvetica-Bold');
      doc.text('SUELDO NETO', leftX, y, { width: 250 });
      doc.text(`$${Number(detail.netPay).toFixed(2)}`, col2X, y, { width: 80, align: 'right' });
      y += 24;

      doc.moveTo(leftX, y).lineTo(552, y).stroke();
      y += 10;

      // -- Footer --
      doc.fontSize(8).font('Helvetica');
      doc.text('Este documento es un comprobante de pago generado electrónicamente.', leftX, y, { align: 'center' });

      doc.end();
    });
  }
}
