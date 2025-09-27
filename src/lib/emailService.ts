interface EmailParams {
  to: string;
  name: string;
  link: string;
}

export const sendVerificationEmail = async ({ to, name, link }: EmailParams) => {
  if (!process.env.EMAIL_FROM) {
    throw new Error("EMAIL_FROM environment variable not set.");
  }
  
  // Example using a conceptual email service (e.g., Resend/SendGrid SDK logic)
  try {
    const emailBody = `
      <h1>Welcome to Our App, ${name}!</h1>
      <p>Please click the link below to verify your email address and activate your account.</p>
      <a href="${link}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify My Email</a>
      <p>If you did not request this, you can safely ignore this email.</p>
    `;

    // Example dispatch logic (Replace with your actual SDK call)
    /* await resend.emails.send({
        from: process.env.EMAIL_FROM, // e.g., 'no-reply@yourdomain.com'
        to: to,
        subject: 'Verify your email address for account activation',
        html: emailBody,
    });
    */
    
    // For development, we'll log the link instead of sending:
    console.log(`[EMAIL SENT] To: ${to}, Link: ${link}`); 
    
  } catch (error) {
    console.error("Error sending verification email:", error);
    // CRITICAL: Log error but do NOT throw it to the user. User creation has already succeeded.
  }
};