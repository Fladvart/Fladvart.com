import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

export interface ContactEmailData {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  serviceInterest?: string;
}

/**
 * Send notification email to admin when a new contact form is submitted
 */
export async function sendContactNotificationEmail(data: ContactEmailData) {
  try {
    const { name, email, phone, company, message, serviceInterest } = data;

    // Email to admin
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@fladvart.com';
    const fromEmail = process.env.FROM_EMAIL!;

    const emailResult = await resend.emails.send({
      from: "mail@fladv.art",
      to: adminEmail,
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background-color: #121727;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 8px 8px 0 0;
              }
              .content {
                background-color: #f9f9f9;
                padding: 30px;
                border: 1px solid #e0e0e0;
                border-top: none;
              }
              .field {
                margin-bottom: 20px;
              }
              .label {
                font-weight: bold;
                color: #555;
                display: block;
                margin-bottom: 5px;
              }
              .value {
                color: #333;
                padding: 10px;
                background-color: white;
                border-left: 3px solid #121727;
                border-radius: 4px;
              }
              .footer {
                text-align: center;
                padding: 20px;
                color: #888;
                font-size: 12px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🔔 New Contact Form Submission</h1>
            </div>
            <div class="content">
              <div class="field">
                <span class="label">Name:</span>
                <div class="value">${name}</div>
              </div>
              
              <div class="field">
                <span class="label">Email:</span>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>
              
              ${phone ? `
              <div class="field">
                <span class="label">Phone:</span>
                <div class="value">${phone}</div>
              </div>
              ` : ''}
              
              ${company ? `
              <div class="field">
                <span class="label">Company:</span>
                <div class="value">${company}</div>
              </div>
              ` : ''}
              
              ${serviceInterest ? `
              <div class="field">
                <span class="label">Service Interest:</span>
                <div class="value">${serviceInterest}</div>
              </div>
              ` : ''}
              
              <div class="field">
                <span class="label">Message:</span>
                <div class="value">${message}</div>
              </div>
            </div>
            <div class="footer">
              <p>This email was sent from the Fladvart contact form</p>
              <p>Please respond to the customer at: ${email}</p>
            </div>
          </body>
        </html>
      `,
    });

    return { success: true, data: emailResult };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}

/**
 * Send confirmation email to the customer
 */
export async function sendContactConfirmationEmail(data: ContactEmailData) {
  try {
    const { name, email } = data;
    const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';

    const emailResult = await resend.emails.send({
      from: "mail@fladv.art",
      to: email,
      subject: 'Thank you for contacting Fladvart',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background-color: #121727;
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 8px 8px 0 0;
              }
              .content {
                background-color: #f9f9f9;
                padding: 30px;
                border: 1px solid #e0e0e0;
                border-top: none;
              }
              .footer {
                background-color: #121727;
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 0 0 8px 8px;
                margin-top: 20px;
              }
              .button {
                display: inline-block;
                padding: 12px 30px;
                background-color: white;
                color: #121727;
                text-decoration: none;
                border-radius: 4px;
                font-weight: bold;
                margin-top: 20px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Thank You for Reaching Out!</h1>
            </div>
            <div class="content">
              <p>Dear ${name},</p>
              
              <p>Thank you for contacting Fladvart. We have received your message and our team will review it shortly.</p>
              
              <p>We typically respond within 24-48 hours during business days. If your inquiry is urgent, please feel free to call us directly at +90 538 9953.</p>
              
              <p>In the meantime, feel free to explore our services and learn more about what we do:</p>
              
              <a href="https://fladvart.com/services" class="button">Explore Our Services</a>
            </div>
            <div class="footer">
              <p><strong>Fladvart Creative HQ</strong></p>
              <p>Nişbetiye, Nişbetiye CD No:24, 34340 Beşiktaş/İstanbul, Türkiye</p>
              <p>Email: info@flad.art | Phone: +90 538 9953</p>
            </div>
          </body>
        </html>
      `,
    });

    return { success: true, data: emailResult };
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return { success: false, error };
  }
}
