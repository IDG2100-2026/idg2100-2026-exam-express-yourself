import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // our gmail "hostname"
    pass: process.env.EMAIL_PASS, // our generated password from google
  },
});

export const sendVerificationMail = async (to, token) => {
  const verificationLink = `${process.env.LOGIN_FRONTEND_URI}/verify-email?code=${token}`; // Link the user will click on

  await transporter.sendMail({
    from: process.send.EMAIL_USER, // our email name
    to, // this will be set in controller TODO: verify
    subject: "Verify your email", // subject on the email
    html: `
            <h1>Welcome to PokerDados</h1>
            <p>Click on the link below to verify your account</p>
            <a href="${verificationLink}">${verificationLink}</a>
            <p>This link will expire after 15 minutes</p>
        `, // what the user will be sent
  });
};
