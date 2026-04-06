export default {
  async afterCreate(event: any) {
    const { result } = event;

    try {
      await strapi.plugins['email'].services.email.send({
        to: 'sales@ladexgroup.com',
        from: 'no-reply@ladexgroup.com',
        replyTo: result.email,
        subject: `[Ladex Group Enquiry] ${result.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #0F0F0F; padding: 24px 32px;">
              <h2 style="color: #C9A227; margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 0.05em;">
                New Website Enquiry
              </h2>
              <p style="color: rgba(255,255,255,0.5); margin: 4px 0 0; font-size: 13px;">
                Ladex Group — ladexgroup.com
              </p>
            </div>

            <div style="background: #f9fafb; padding: 32px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; width: 140px;">
                    <strong style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280;">Name</strong>
                  </td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 15px; color: #111827;">
                    ${result.full_name}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                    <strong style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280;">Email</strong>
                  </td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 15px;">
                    <a href="mailto:${result.email}" style="color: #C9A227;">${result.email}</a>
                  </td>
                </tr>
                ${result.phone ? `
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                    <strong style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280;">Phone</strong>
                  </td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 15px; color: #111827;">
                    ${result.phone}
                  </td>
                </tr>` : ''}
                ${result.service ? `
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                    <strong style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280;">Service</strong>
                  </td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 15px; color: #111827;">
                    ${result.service}
                  </td>
                </tr>` : ''}
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                    <strong style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280;">Subject</strong>
                  </td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-size: 15px; color: #111827;">
                    ${result.subject}
                  </td>
                </tr>
              </table>

              <div style="margin-top: 24px;">
                <strong style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; display: block; margin-bottom: 10px;">
                  Message
                </strong>
                <div style="background: #fff; border: 1px solid #e5e7eb; border-radius: 4px; padding: 16px; font-size: 15px; color: #374151; line-height: 1.7; white-space: pre-wrap;">
${result.message}
                </div>
              </div>

              <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                <a href="mailto:${result.email}?subject=Re: ${encodeURIComponent(result.subject)}"
                   style="display: inline-block; background: #C9A227; color: #0F0F0F; padding: 12px 24px; border-radius: 4px; font-weight: 700; font-size: 13px; text-decoration: none; text-transform: uppercase; letter-spacing: 0.05em;">
                  Reply to ${result.full_name}
                </a>
              </div>
            </div>

            <div style="background: #0F0F0F; padding: 16px 32px; text-align: center;">
              <p style="color: rgba(255,255,255,0.3); font-size: 12px; margin: 0;">
                Ladex Group · ladexgroup.com · sales@ladexgroup.com
              </p>
            </div>
          </div>
        `,
      });
    } catch (err) {
      // Log but don't throw — the contact record is already saved
      strapi.log.error('Failed to send contact notification email:', err);
    }
  },
};
