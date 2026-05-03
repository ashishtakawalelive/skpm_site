// ===== CONFIG =====
const CONTACT_SHEET = 'contact';
const CAREERS_SHEET = 'careers';
const NOTIFY_EMAIL = 'contact@skpm.co.in';
const CAREERS_DRIVE_FOLDER_ID = '1bUWp24nAMYSKliwiWTXBcukzt4b9v_SO';

// ===== MAIN WEBHOOK =====
function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const p = e && e.parameter ? e.parameter : {};
    const formType = (p.form_type || 'contact').toLowerCase().trim();
    const timestamp = new Date();

    if (formType === 'careers') {
      const sheet = getOrCreateSheet_(ss, CAREERS_SHEET, [
        'Timestamp',
        'Name',
        'Email',
        'Phone',
        'Position',
        'Qualification',
        'Experience',
        'LinkedIn',
        'Cover Letter',
        'Resume File Name',
        'Resume Drive URL'
      ]);

      const name = p.name || '';
      const email = p.email || '';
      const phone = p.phone || '';
      const position = p.position || '';
      const qualification = p.qualification || '';
      const experience = p.experience || '';
      const linkedin = p.linkedin || '';
      const message = p.message || '';

      let resumeName = '';
      let resumeUrl = '';
      if (p.resume_base64 && p.resume_name && p.resume_mime) {
        const bytes = Utilities.base64Decode(p.resume_base64);
        const blob = Utilities.newBlob(bytes, p.resume_mime, p.resume_name);
        const folder = DriveApp.getFolderById(CAREERS_DRIVE_FOLDER_ID);
        const file = folder.createFile(blob);
        resumeName = file.getName();
        resumeUrl = file.getUrl();
      }

      sheet.appendRow([
        timestamp, name, email, phone, position, qualification,
        experience, linkedin, message, resumeName, resumeUrl
      ]);

      const subject = `New Career Application - ${name || 'Unknown'}`;
      const body =
        'New career application received.\n\n' +
        `Name: ${name}\n` +
        `Email: ${email}\n` +
        `Phone: ${phone}\n` +
        `Position: ${position}\n` +
        `Qualification: ${qualification}\n` +
        `Experience: ${experience}\n` +
        `LinkedIn: ${linkedin}\n` +
        `Cover Letter: ${message || 'Not provided'}\n` +
        `Resume: ${resumeUrl || 'Not uploaded'}\n`;

      MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
      try { sendAcknowledgmentEmail(p); } catch (ackErr) { Logger.log('Careers ack email error: ' + ackErr); }
      return json_({ result: 'success', form_type: 'careers' });
    }

    // Default: contact form
    const contactSheet = getOrCreateSheet_(ss, CONTACT_SHEET, [
      'Timestamp', 'Name', 'Email', 'Phone', 'Message'
    ]);

    const name = p.name || 'Not provided';
    const email = p.email || 'Not provided';
    const phone = p.phone || 'Not provided';
    const message = p.message || 'Not provided';

    contactSheet.appendRow([timestamp, name, email, phone, message]);

    const subject = 'New Contact Form Submission - SKPM Website';
    const body =
      'You have received a new contact form submission.\n\n' +
      `Name: ${name}\n` +
      `Email: ${email}\n` +
      `Phone: ${phone}\n\n` +
      `Message:\n${message}`;

    MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
    try { sendAcknowledgmentEmail(p); } catch (ackErr) { Logger.log('Contact ack email error: ' + ackErr); }
    return json_({ result: 'success', form_type: 'contact' });

  } catch (err) {
    return json_({ result: 'error', error: String(err) });
  }
}

// ===== ACKNOWLEDGMENT EMAIL =====
function sendAcknowledgmentEmail(p) {
  const userEmail = p.email;
  const userName  = p.name || 'there';
  const formType  = (p.form_type || 'contact').toLowerCase().trim();

  Logger.log('sendAcknowledgmentEmail called — email: ' + userEmail + ', formType: ' + formType);
  if (!userEmail) { Logger.log('No email found — skipping ack'); return; }

  if (formType === 'careers') {
    const position = p.position || 'the open position';
    MailApp.sendEmail({
      to:       userEmail,
      name:     'Customer Care Team SKPM',
      subject:  'We received your application — S K P M & Associates LLP',
      htmlBody: careersAckHtml(userName, position)
    });
  } else {
    MailApp.sendEmail({
      to:       userEmail,
      name:     'Customer Care Team SKPM',
      subject:  'We received your message — S K P M & Associates LLP',
      htmlBody: contactAckHtml(userName)
    });
  }
}

function contactAckHtml(name) {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#1a3c5e;padding:28px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;letter-spacing:2px;">S K P M &amp; Associates LLP</h1>
            <p style="margin:6px 0 0;color:#a8c4de;font-size:13px;">Chartered Accountants</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 16px;font-size:16px;color:#222;">Dear ${name},</p>
            <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.6;">
              Thank you for reaching out to us. We have successfully received your message and our team will review it shortly.
            </p>
            <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.6;">
              We typically respond within <strong>24 business hours</strong>. If your query is urgent, feel free to call us directly.
            </p>

            <!-- Info Box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;border-left:4px solid #1a3c5e;border-radius:4px;margin:24px 0;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0 0 6px;font-size:13px;color:#555;"><strong>Phone:</strong> +91-8830239955 / +91-20-47256542</p>
                  <p style="margin:0 0 6px;font-size:13px;color:#555;"><strong>Email:</strong> contact@skpm.co.in</p>
                  <p style="margin:0;font-size:13px;color:#555;"><strong>Hours:</strong> Mon&ndash;Fri 10 AM&ndash;7 PM &nbsp;|&nbsp; Sat 10 AM&ndash;2 PM</p>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:15px;color:#444;line-height:1.8;">
              Warm regards,<br>
              <strong>S K P M &amp; Associates LLP</strong>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f0f4f8;padding:16px 40px;text-align:center;border-top:1px solid #e0e0e0;">
            <p style="margin:0;font-size:12px;color:#888;">
              602, Akshay House, Behind Nagnath Par, Sadashiv Peth, Pune &ndash; 411030<br>
              This is an automated acknowledgment. Please do not reply to this email.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function careersAckHtml(name, position) {
  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#1a3c5e;padding:28px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;letter-spacing:2px;">S K P M &amp; Associates LLP</h1>
            <p style="margin:6px 0 0;color:#a8c4de;font-size:13px;">Chartered Accountants</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 16px;font-size:16px;color:#222;">Dear ${name},</p>
            <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.6;">
              Thank you for your interest in joining <strong>S K P M &amp; Associates LLP</strong>. We have successfully received your application for the position of <strong>${position}</strong>.
            </p>
            <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.6;">
              Our hiring team will carefully review your profile and resume. If your qualifications match our requirements, we will contact you to schedule the next steps.
            </p>

            <!-- What to expect box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;border-left:4px solid #1a3c5e;border-radius:4px;margin:24px 0;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0 0 8px;font-size:14px;color:#333;font-weight:bold;">What happens next?</p>
                  <p style="margin:0 0 6px;font-size:13px;color:#555;">1. Our team reviews your application (typically within 5&ndash;7 business days).</p>
                  <p style="margin:0 0 6px;font-size:13px;color:#555;">2. Shortlisted candidates will be contacted for an initial discussion.</p>
                  <p style="margin:0;font-size:13px;color:#555;">3. Interview rounds as per the role requirements.</p>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 16px;font-size:15px;color:#444;line-height:1.6;">
              We appreciate the time you took to apply and wish you the very best.
            </p>
            <p style="margin:0;font-size:15px;color:#444;line-height:1.8;">
              Warm regards,<br>
              <strong>S K P M &amp; Associates LLP</strong>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f0f4f8;padding:16px 40px;text-align:center;border-top:1px solid #e0e0e0;">
            <p style="margin:0;font-size:12px;color:#888;">
              602, Akshay House, Behind Nagnath Par, Sadashiv Peth, Pune &ndash; 411030<br>
              This is an automated acknowledgment. Please do not reply to this email.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ===== HELPERS =====
function getOrCreateSheet_(ss, name, header) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) sh.appendRow(header);
  return sh;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
