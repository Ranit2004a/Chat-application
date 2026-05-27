export function getWelcomeEmailTemplate(name, clientURL) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome Email</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, sans-serif;">

  <table align="center" width="100%" cellpadding="0" cellspacing="0" style="padding:30px 0;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0" 
          style="background:#ffffff; border-radius:8px; overflow:hidden;">

          <!-- Header -->
          <tr>
            <td 
              style="background:linear-gradient(90deg, #3b474d, #5068c6);
              padding:40px 20px; text-align:center; color:white;">

              <div 
                style="width:70px; height:70px; border-radius:50%;
                background:white; margin:0 auto 20px;
                line-height:70px;
                font-size:32px;">

                💬
              </div>

              <h1 style="margin:0; font-size:28px; font-weight:bold;">
                Welcome to Messenger!
              </h1>

            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px 35px; color:#333333;">

              <h2 style="margin-top:0; color:#4a63d8;">
                Hello ${name},
              </h2>

              <p style="font-size:16px; line-height:1.7; color:#666666;">
                We’re excited to have you join our messaging platform! 
                Messenger connects you with friends, family, and colleagues 
                in real-time, no matter where they are.
              </p>

              <!-- Steps Box -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#f8f9fc; border-left:4px solid #39c6d6;
                border-radius:6px; margin:30px 0;">

                <tr>
                  <td style="padding:25px;">

                    <h3 style="margin-top:0; color:#222222;">
                      Get started in just a few steps:
                    </h3>

                    <ul style="padding-left:20px; color:#555555; line-height:2;">
                      <li>Set up your profile picture</li>
                      <li>Find and add your contacts</li>
                      <li>Start a conversation</li>
                      <li>Share photos, videos, and more</li>
                    </ul>

                  </td>
                </tr>
              </table>

              <!-- Button -->
              <div style="text-align:center; margin:35px 0;">

                <a href="${clientURL}"
                  style="
                    background:linear-gradient(90deg, #39c6d6, #5b7cff);
                    color:white;
                    text-decoration:none;
                    padding:14px 35px;
                    border-radius:30px;
                    font-size:16px;
                    display:inline-block;
                    font-weight:bold;
                  ">
                  Open Messenger
                </a>

              </div>

              <p style="font-size:15px; color:#666666; line-height:1.7;">
                If you need any help or have questions, we’re always here to assist you.
                <br /><br />
                Happy messaging!
              </p>

              <p style="margin-top:40px; color:#444444;">
                Best regards,<br/>
                <strong>The Messenger Team</strong>
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `;
}