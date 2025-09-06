import React, { useState, useRef, useEffect, useCallback } from "react";
import {useNavigate } from 'react-router-dom';

import styles from "../styles/VerifyOtp.module.css";
import apiService from "../services/api";


const OTP_LENGTH = 6;
const RESEND_TIMER_SECONDS = 300;

const VerifyOtp: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState(RESEND_TIMER_SECONDS);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  const startTimer = useCallback(() => {
    setTimer(RESEND_TIMER_SECONDS);
  }, []);

  useEffect(() => {
    startTimer();
  }, [startTimer]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError(null);
    setSuccess(false);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasteData)) {
      const newOtp = pasteData.split("");
      setOtp(newOtp);
      setError(null);
      setSuccess(false);
      inputRefs.current[OTP_LENGTH - 1]?.focus();
    }
  };

    const handleVerify = async () => {
        setIsVerifying(true);
        setError(null);
        setSuccess(false);

        const code = otp.join("");

        try {
            
            const res = await apiService.verifyOtp(code); // 👈 gọi sang service
            if (res?.success) {
                setSuccess(true);
                navigate('/login');

            } else {
            setError(res?.message || "Mã OTP không hợp lệ. Vui lòng thử lại.");
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        setOtp(Array(OTP_LENGTH).fill(""));
        setError(null);
        setSuccess(false);
        startTimer();
      inputRefs.current[0]?.focus();
        try {
            await apiService.resresendOtp(); // 👈 gọi sang service
        } catch (err: any) {
            setError(err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.");
        }
    };

  const isVerifyButtonDisabled = otp.some((digit) => digit === "") || isVerifying || success;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Xác minh OTP</h1>
      <p className={styles.subtitle}>Vui lòng nhập mã OTP được gửi đến email của bạn.</p>

      <div className={styles.otpInputs} onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
                inputRefs.current[index] = el;
            }}
                type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={isVerifying}
          />
        ))}
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>Xác minh thành công!</p>}

      <button
        className={styles.button}
        onClick={handleVerify}
        disabled={isVerifyButtonDisabled}
      >
        {isVerifying ? "Đang xác minh..." : "Xác minh"}
      </button>

      <div className={styles.timer}>
        {timer > 0 ? (
          <p>
            Bạn có thể gửi lại mã sau:{" "}
            <strong>
              {String(Math.floor(timer / 60)).padStart(2, "0")}:
              {String(timer % 60).padStart(2, "0")}
            </strong>
          </p>
        ) : (
          <p>
            Không nhận được mã?{" "}
            <button className={styles.resend} onClick={handleResend}>
              Gửi lại mã
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default VerifyOtp;
