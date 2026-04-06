import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private transporter;

    constructor() {
        const isProd = process.env.NODE_ENV === 'production';
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.MAIL_USER || 'chasity55@ethereal.email',
                pass: process.env.MAIL_PASS || 'xA1v1fvEhAuQSN4w95',
            },
            tls: isProd ? undefined : {
                rejectUnauthorized: false
            }
        });
    }

    async sendMail(to: string, subject: string, html: string) {
        try{
            await this.transporter.sendMail({
                from: `SmartAssignAI System`,
                to,
                subject,
                html,
            });
        } catch (error) {
            console.error('Error sending email:', error)
            throw new Error('Failed to send email');
        }
    }

}

