import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // our gmail "hostname"
    pass: process.env.EMAIL_PASS, // our generated password from google
  },
});

export const sendVerificationMail = async (to, token) => {
  const verificationLink = `${process.env.FRONTEND_URI}/login?code=${token}`; // Link the user will click on

  await transporter.sendMail({
    from: process.env.EMAIL_USER, // our email name
    to, // this will be set in controller with newUser.email
    subject: "Verify your email", // subject on the email
    html: `
            <h1>Welcome to PokerDados</h1>
            <p>Click on the link below to verify your account</p>
            <a href="${verificationLink}">${verificationLink}</a>
            <p>This link will expire after 15 minutes</p>
        `, // what the user will be sent
  });
};

export const sendPasswordResetMail = async (to, token) => {
  const resetPasswordLink = `${process.env.FRONTEND_URI}/reset-password?code=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Reset your password",
    html: `
      <h1>Reset your password</h1>
      <p>Click on the link below to be redirected to the reset password page</p>
      <a href="${resetPasswordLink}">${resetPasswordLink}</a>
      <p>This link will expire after 15 minutes</p>
    `,
  });
};
