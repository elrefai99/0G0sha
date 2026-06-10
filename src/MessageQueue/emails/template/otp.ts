interface IPayload {
     otp_code: number
     expiry_minutes: number
     user_name: string
}
export const otpTemp = (payload: IPayload) => {
     return `
     <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "https://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no" />
  <meta name="color-scheme" content="light dark" />
  <meta name="supported-color-schemes" content="light dark" />
  <title> 0Gohsa verification code</title>

  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <style>
    table, td, div, h1, p { font-family: Arial, Helvetica, sans-serif !important; }
    .otp-code { font-family: Consolas, monospace !important; }
  </style>
  <![endif]-->

  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
    img { -ms-interpolation-mode:bicubic; border:0; height:auto; line-height:100%; outline:none; text-decoration:none; }
    table { border-collapse:collapse !important; }
    body { margin:0 !important; padding:0 !important; width:100% !important; background-color:#ECECEE; }
    a[x-apple-data-detectors] { color:inherit !important; text-decoration:none !important; }
    :root { color-scheme: light dark; supported-color-schemes: light dark; }

    @media screen and (max-width:620px) {
      .container { width:100% !important; }
      .px { padding-left:24px !important; padding-right:24px !important; }
      .otp-code { font-size:34px !important; letter-spacing:8px !important; }
    }
  </style>
</head>

<body style="margin:0; padding:0; background-color:#ECECEE;">
  <!-- Preheader (hidden preview text) -->
  <div style="display:none; max-height:0; overflow:hidden; mso-hide:all; font-size:1px; line-height:1px; color:#ECECEE; opacity:0;">
    Your 0Gohsa verification code is ${payload.otp_code} &mdash; it expires in ${payload.expiry_minutes} minutes.
    &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ECECEE;">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <!--[if mso | IE]><table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" width="600"><tr><td><![endif]-->
        <table role="presentation" class="container" align="center" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px; max-width:600px; background-color:#FFFFFF; border:1px solid #E4E4E7; border-radius:12px;">

          <!-- Header / Logo -->
          <tr>
            <td align="center" class="px" style="padding:40px 40px 24px 40px; border-bottom:1px solid #F0F0F1;">
              <img src="https://lh3.googleusercontent.com/d/1VEvn9IHM9hGmx2YRhfvKiqExMB57ojfK" width="56" height="56" alt="0Gohsa" style="display:block; width:56px; height:56px; border-radius:50%;" />
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="px" style="padding:36px 40px 8px 40px;">
              <h1 style="margin:0 0 16px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; font-size:24px; line-height:32px; font-weight:700; color:#18181B; text-align:center;">
                Verify your email
              </h1>
              <p style="margin:0 0 8px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; font-size:15px; line-height:24px; color:#52525B; text-align:center;">
                Hi ${payload.user_name}, use the code below to complete your sign-in. This code expires in <strong style="color:#18181B;">${payload.expiry_minutes} minutes</strong>.
              </p>
            </td>
          </tr>

          <!-- OTP box -->
          <tr>
            <td class="px" style="padding:24px 40px 8px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" bgcolor="#F4F4F5" style="background-color:#F4F4F5; border:1px solid #E4E4E7; border-radius:10px; padding:24px 16px;">
                    <div class="otp-code" style="font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace; font-size:40px; line-height:48px; letter-spacing:12px; font-weight:700; color:#18181B; text-indent:12px;">
                      ${payload.otp_code}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Security note -->
          <tr>
            <td class="px" style="padding:20px 40px 36px 40px;">
              <p style="margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; font-size:13px; line-height:20px; color:#A1A1AA; text-align:center;">
                If you didn&rsquo;t request this code, you can safely ignore this email &mdash; someone may have entered your address by mistake. Never share this code with anyone.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="px" style="padding:24px 40px 32px 40px; border-top:1px solid #F0F0F1;">
              <p style="margin:0 0 6px 0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; font-size:12px; line-height:18px; color:#A1A1AA; text-align:center;">
                Need help? Contact us at <a href="mailto:${process.env.EMAIL}" style="color:#52525B; text-decoration:underline;">${process.env.EMAIL}</a>
              </p>
              <p style="margin:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; font-size:12px; line-height:18px; color:#A1A1AA; text-align:center;">
                0Gohsa.elrefai.me<br />
                &copy; ${new Date().getFullYear()}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
        <!--[if mso | IE]></td></tr></table><![endif]-->

      </td>
    </tr>
  </table>
</body>
</html>`
}
