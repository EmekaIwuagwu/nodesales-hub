import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || '465'),
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        const info = await transporter.sendMail({
            from: `"Kortana Network" <${process.env.EMAIL_FROM}>`,
            to,
            subject,
            html,
        });
        console.log('Message sent: %s', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
};

export const getWelcomeEmailTemplate = (fullName: string, tier: string, walletAddress: string, referralLink: string) => `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
  <h2 style="color: #6366f1;">Welcome to Kortana Presale! 🚀</h2>
  <p>Dear ${fullName},</p>
  <p>Welcome to the Kortana Network presale! We're thrilled to have you join our community.</p>
  
  <div style="background: #f9fafb; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <h3 style="margin-top: 0;">Your Registration Details:</h3>
    <ul style="list-style: none; padding: 0;">
      <li><strong>Tier:</strong> ${tier.toUpperCase()}</li>
      <li><strong>Wallet Address:</strong> ${walletAddress}</li>
      <li><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</li>
    </ul>
  </div>

  <div style="background: #eef2ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #6366f1;">
    <h3 style="margin-top: 0;">Your Unique Referral Link:</h3>
    <p style="word-break: break-all;"><a href="${referralLink}" style="color: #6366f1; font-weight: bold;">${referralLink}</a></p>
    <p style="font-size: 0.9em; color: #666;">Share this link with friends and earn 10% bonus tokens for every successful referral!</p>
  </div>

  <h3>What's Next?</h3>
  <ol>
    <li>Confirm your email address (if link was sent)</li>
    <li>Share your referral link with your network</li>
    <li>Watch your referral bonuses accumulate</li>
    <li>Await token distribution after presale closes</li>
  </ol>

  <p>Questions? Visit our FAQ or contact <a href="mailto:support@kortana.network" style="color: #6366f1;">support@kortana.network</a></p>
  
  <p>Best regards,<br/>The Kortana Team</p>
</div>
`;
