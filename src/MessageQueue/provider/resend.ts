import { Resend } from 'resend';

export const resendFunction = async (to: string, html: string, subject: string,) => {
     const resend = new Resend(process.env.RESEND_API_KEY as string);
     try {
          const { data, error } = await resend.emails.send({
               from: "0Gosha <0gosha@0elrefai.me.com>",
               to,
               subject,
               html,
          });

          if (error) {
               console.error("❌ Resend error:", error);
               throw error;
          }

          console.log("✅ Email sent successfully via Resend:", data?.id);
          return;
     } catch (error) {
          console.error("❌ Failed to send email via Resend:", error);
          throw error;
     }
}
