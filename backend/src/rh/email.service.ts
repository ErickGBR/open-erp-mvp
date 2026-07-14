import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly from: string;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    this.from = this.configService.get<string>('SMTP_FROM', 'noreply@open-erp.com');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: port || 587,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log('Email transporter initialized');
    } else {
      this.logger.warn(
        'SMTP not configured — emails will be logged to console. Set SMTP_HOST, SMTP_USER, SMTP_PASS env vars.',
      );
    }
  }

  /**
   * Sanitize a string for safe use in email headers and filenames
   * by removing CR, LF, and other control characters.
   */
  private sanitize(value: string): string {
    return value.replace(/[\r\n\x00-\x08\x0B\x0C\x0E-\x1F]/g, '').trim();
  }

  async sendPayslip(
    to: string,
    employeeName: string,
    periodName: string,
    pdfBuffer: Buffer,
  ): Promise<boolean> {
    const safeEmployeeName = this.sanitize(employeeName);
    const safePeriodName = this.sanitize(periodName);
    const subject = `Payslip - ${safePeriodName}`;
    const text = `Dear ${safeEmployeeName},\n\nPlease find attached your payment receipt for the period ${safePeriodName}.\n\nBest regards,\nHuman Resources Department`;

    return this.sendMail(to, subject, text, pdfBuffer, `payslip-${safePeriodName.replace(/\s+/g, '-').toLowerCase()}.pdf`);
  }

  async sendMail(
    to: string,
    subject: string,
    text: string,
    pdfBuffer?: Buffer,
    pdfFilename?: string,
  ): Promise<boolean> {
    if (!this.transporter) {
      this.logger.log(`[EMAIL LOG] To: ${to} | Subject: ${subject}`);
      return true;
    }

    try {
      const mailOptions: nodemailer.SendMailOptions = {
        from: this.from,
        to,
        subject,
        text,
      };

      if (pdfBuffer && pdfFilename) {
        mailOptions.attachments = [
          {
            filename: pdfFilename,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ];
      }

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent to ${to}: ${subject}`);
      return true;
    } catch (error: unknown) {
      this.logger.error(`Failed to send email to ${to}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }
}
