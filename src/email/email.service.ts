import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs/promises';
import * as path from 'path';
import { notificationType, NotificationType } from './constants';
import enviroments from '@/core/utils/enviroments';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private template: handlebars.TemplateDelegate;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
    this.initializeTemplate();
  }

  private initializeTransporter(): void {
    const emailConfig: EmailConfig = {
      host: this.configService.get<string>(enviroments.MAILGUN.HOSTNAME),
      port: this.configService.get<number>(enviroments.MAILGUN.PORT) || 587,
      secure:
        this.configService.get<boolean>(enviroments.MAILGUN.EMAIL_SECURE) ||
        false,
      auth: {
        user: this.configService.get<string>(enviroments.MAILGUN.AUTH_USER),
        pass: this.configService.get<string>(enviroments.MAILGUN.AUTH_PASS),
      },
    };

    this.transporter = nodemailer.createTransport(emailConfig);
  }

  private async initializeTemplate(): Promise<void> {
    try {
      const templatePath = path.join(
        process.cwd(),
        'templates',
        'email',
        'email-generic.hbs',
      );
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      this.template = handlebars.compile(templateContent);
    } catch (error) {
      this.logger.error('Failed to load email template', error);
      throw new Error('Email template not found');
    }
  }

  generateHTML(notificationId: NotificationType, content?: string): string {
    const notificationConfig = notificationType[notificationId];

    const context = {
      header: notificationConfig.header,
      body: notificationConfig.body,
      showCode: notificationConfig.showCode,
      code: notificationConfig.showCode ? content : undefined,
      message: notificationConfig.showCode ? undefined : content,
    };

    return this.template(context);
  }

  async sendNotification(args: {
    to: string | string[];
    notificationId: NotificationType;
    content?: string;
  }): Promise<boolean> {
    const { to, notificationId, content } = args;
    try {
      const notificationConfig = notificationType[notificationId];
      const html = this.generateHTML(notificationId, content);

      return await this.sendEmail(to, notificationConfig.subject, html);
    } catch (error) {
      this.logger.error(`Failed to send ${notificationId} notification`, error);
      return false;
    }
  }

  async sendEmail(
    to: string | string[],
    subject: string,
    html: string,
    text?: string,
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.configService.get<string>(enviroments.MAILGUN.SENDER_EMAIL),
        to: Array.isArray(to) ? to.join(',') : to,
        subject,
        html,
        text: text || this.htmlToText(html),
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to: ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to: ${to}`, error);
      return false;
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('Email transporter connection verified');
      return true;
    } catch (error) {
      this.logger.error('Email transporter connection failed', error);
      return false;
    }
  }

  private htmlToText(html: string): string {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<p>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
}
