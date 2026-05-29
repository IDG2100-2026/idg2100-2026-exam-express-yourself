import { useState, useEffect } from "react";
import { verifyEmail, requestResetPassword } from "../../services/auth-service";
import { Link, useSearchParams } from "react-router-dom";
import "../login/login.scss";

const ForgotPassword = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [resetMessage, setResetMessage] = useState("");
  const [sendMail, setSendMail] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);


  const sendEmailCode = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const data = await requestResetPassword(sendMail); // sending the email with reset password link!
      setResetMessage(data.message); // showing success msg
    } catch (err) {
      setError(err.message); // showing error msg
    } finally {
      setIsSubmitting(false); // cleanup so we don't have submitting to true anymore
    }
  };

  return (
    <section className="forgotPassword">
      <div className="forgotPassword__card">
        <form className="forgotPassword__field" onSubmit={sendEmailCode}>
          <h2 className="forgotPassword__title">Forgot Password</h2>
          {resetMessage ? <span className="forgotPassword__success">{resetMessage}</span> : <span className="forgotPassword__error">{error}</span>}
          <input
            type="email"
            value={sendMail}
            onChange={(e) => setSendMail(e.target.value)} // sending the email to the inputted email
            placeholder="Enter your email"
          />
          <button className="forgotPassword__submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending email...." : "Send reset link"}
          </button>
          <Link className="forgotPassword__forgot" to="/login">
            Back to login
          </Link>
        </form>
      </div>
    </section>
  );
};

export default ForgotPassword;
