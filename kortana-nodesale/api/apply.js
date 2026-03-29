/**
 * Vercel Serverless Function — SMTP Email Relay
 * Route: /api/apply  (POST)
 * 
 * Set these in Vercel Dashboard → Project Settings → Environment Variables:
 *   SMTP_HOST     = mail.qstix.com.ng
 *   SMTP_PORT     = 465
 *   SMTP_USER     = no-reply2@qstix.com.ng
 *   SMTP_PASS     = EmekaIwuagwu87**
 *   NOTIFY_EMAIL  = emeka@kortana.network
 */

import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    // CORS headers — allow all origins for node sale form
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    const { tier, tron_hash, kortana_address, email, message } = req.body;

    if (!tron_hash || !kortana_address || !email) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'mail.qstix.com.ng',
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: true,
        auth: {
            user: process.env.SMTP_USER || 'no-reply2@qstix.com.ng',
            pass: process.env.SMTP_PASS || 'EmekaIwuagwu87**'
        },
        tls: { rejectUnauthorized: false }
    });

    const mailOptions = {
        from: '"Kortana Node Sale" <no-reply2@qstix.com.ng>',
        to: process.env.NOTIFY_EMAIL || 'emeka@kortana.network',
        replyTo: email,
        subject: `[Kortana Node Sale] New ${tier || 'Unknown'} Tier Application`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0a0f1e; color: #fff; border-radius: 12px;">
                <h2 style="color: #0ea5e9; margin-bottom: 24px;">⬡ New Node License Application</h2>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #1e293b;">
                        <td style="padding: 12px 0; color: #94a3b8; width: 40%;">Tier Selected</td>
                        <td style="padding: 12px 0; font-weight: bold; color: #22d3ee;">${tier || 'Not specified'}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #1e293b;">
                        <td style="padding: 12px 0; color: #94a3b8;">TX Hash (Tron/BEP20)</td>
                        <td style="padding: 12px 0; font-family: monospace; word-break: break-all;">${tron_hash}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #1e293b;">
                        <td style="padding: 12px 0; color: #94a3b8;">Kortana Wallet Address</td>
                        <td style="padding: 12px 0; font-family: monospace; word-break: break-all;">${kortana_address}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid #1e293b;">
                        <td style="padding: 12px 0; color: #94a3b8;">Applicant Email</td>
                        <td style="padding: 12px 0;"><a href="mailto:${email}" style="color: #0ea5e9;">${email}</a></td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: #94a3b8;">Notes</td>
                        <td style="padding: 12px 0;">${message || 'None'}</td>
                    </tr>
                </table>
                <hr style="border-color: #1e293b; margin: 24px 0;">
                <p style="color: #64748b; font-size: 0.875rem;">Submitted: ${new Date().toUTCString()}</p>
                <p style="color: #64748b; font-size: 0.875rem;">Reply to this email to contact the applicant directly.</p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent — Message ID: ${info.messageId}`);
        return res.status(200).json({ success: true, message: 'Application received and email sent.' });
    } catch (error) {
        console.error('SMTP Error:', error.message);
        return res.status(500).json({ error: 'Email delivery failed.', detail: error.message });
    }
}
