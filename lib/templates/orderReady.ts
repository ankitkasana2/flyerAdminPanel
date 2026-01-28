

interface OrderReadyParams {
  name: string;
  orderId: string;
  downloadUrl: string;
  imageUrl?: string;
  customerEmail: string;
}

import fs from 'fs';
import path from 'path';

export const orderReadyTemplate = ({
  name,
  orderId,
  downloadUrl,
  imageUrl,
  customerEmail,
}: OrderReadyParams) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // Convert logo to base64 to ensure it shows up even on localhost
  let logoBase64 = '';
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
    }
  } catch (error) {
    console.error('Error loading logo for email:', error);
  }

  const logoUrl = logoBase64 || `${baseUrl}/logo.png`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your Flyer is Ready!</title>
</head>
<body style="margin:0; padding:0; background-color:#000000; font-family: Arial, Helvetica, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000; padding:30px 0;">
    <tr>
      <td align="center">
        
        <!-- Card -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#141414; border-radius:12px; overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding:30px; text-align:center; background-color:#000000;">
              <img src="${logoUrl}" alt="Grodify Logo" width="140" style="display:block; margin:0 auto;" />
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px; color:#ffffff;">
              <h1 style="font-size:28px; margin:0 0 20px; font-weight:700; text-align:center;">
                Hi ${name && name !== 'Valued Customer' ? name : 'there'}, your flyer is ready!
              </h1>

              <p style="font-size:16px; line-height:1.6; color:#b3b3b3; text-align:center;">
                Our creative team has finished your custom design. 
                You can now view and download your high-resolution files below.
              </p>

              <!-- Main Preview -->
              ${imageUrl ? `
              <div style="margin:30px 0; border:1px solid #333; border-radius:8px; overflow:hidden; background-color:#000;">
                <img src="${imageUrl}" alt="Your Flyer" style="width:100%; height:auto; display:block;" />
              </div>
              ` : ''}

              <!-- Order Info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
                <tr>
                  <td width="100%" valign="top">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1f1f1f; border-radius:8px;">
                      <tr>
                        <td style="padding:15px; color:#b3b3b3; font-size:14px;">Order ID</td>
                        <td style="padding:15px; text-align:right; color:#ffffff; font-weight:600; font-size:14px;">#${orderId}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <div style="text-align:center; margin-top:40px;">
                <a href="${downloadUrl}"
                   style="background-color:#E50914; color:#ffffff; padding:16px 40px;
                          text-decoration:none; font-weight:700; border-radius:6px; display:inline-block; font-size:16px;">
                  Download Your Flyer
                </a>
              </div>

              <p style="margin-top:40px; font-size:14px; color:#b3b3b3; text-align:center;">
                Thank you for choosing Grodify for your creative needs! ✨
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:25px; background-color:#000000; text-align:center; font-size:12px; color:#808080; border-top:1px solid #1f1f1f;">
              <p style="margin:5px 0;">© ${new Date().getFullYear()} Grodify - Premium Designs</p>
              <p style="margin:5px 0;">
                <a href="${baseUrl}/contact" style="color:#b3b3b3; text-decoration:none;">Help Center</a> ·
                <a href="#" style="color:#b3b3b3; text-decoration:none;">Support</a>
              </p>
            </td>
          </tr>

        </table>
        <!-- End Card -->

      </td>
    </tr>
  </table>

</body>
</html>
`;
};
