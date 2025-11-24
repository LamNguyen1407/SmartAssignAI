import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });
    }

    async sendMail(to: string, subject: string, html: string) {
        try{
            await this.transporter.sendMail({
                from: `"SmartAssignAI" System`,
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

