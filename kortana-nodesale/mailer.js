/**
 * Kortana Node Sale — SMTP Email Relay Server
 * Run with: node mailer.js
 * Listens on http://localhost:3001
 */

import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';

const app = express();
app.use(cors()); // Allow requests from localhost:8080 frontend
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- SMTP Configuration ---
const transporter = nodemailer.createTransport({
    host: 'mail.qstix.com.ng',
    port: 465,
    secure: true, // SSL on port 465
    auth: {
        user: 'no-reply2@qstix.com.ng',
        pass: 'EmekaIwuagwu87**'
    },
    tls: {
        rejectUnauthorized: false // Allow self-signed certs from custom SMTP hosts
    }
});

// --- Verify SMTP connection on startup ---
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ SMTP Connection Failed:', error.message);
    } else {
        console.log('✅ SMTP Server Connected. Ready to send emails.');
    }
});

// --- Email Relay Endpoint ---
app.post('/apply', async (req, res) => {
    const { tier, tron_hash, kortana_address, email, message } = req.body;

    if (!tron_hash || !kortana_address || !email) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }

    const mailOptions = {
        from: '"Kortana Node Sale" <no-reply2@qstix.com.ng>',
        to: 'emeka@kortana.network', // Foundation inbox for new applications
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
        console.log(`✅ Email sent to ${mailOptions.to} — Message ID: ${info.messageId}`);
        res.json({ success: true, message: 'Application received and email sent.' });
    } catch (error) {
        console.error('❌ Failed to send email:', error.message);
        res.status(500).json({ error: 'Email delivery failed.', detail: error.message });
    }
});

app.get('/health', (req, res) => res.json({ status: 'ok', smtp: 'mail.qstix.com.ng:465' }));

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`\n🚀 Kortana Mailer running at http://localhost:${PORT}`);
    console.log(`   → POST to http://localhost:${PORT}/apply to relay emails\n`);
});
