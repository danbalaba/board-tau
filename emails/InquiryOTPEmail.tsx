import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Img,
} from '@react-email/components';
import * as React from 'react';
import { lightLogoUrl, darkLogoUrl } from '../services/email/constants';

interface InquiryOTPEmailProps {
  otp: string;
  userName: string;
}

export const InquiryOTPEmail = ({
  otp,
  userName,
}: InquiryOTPEmailProps) => {
  return (
    <Html>
      <Head>
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              margin: 0;
              padding: 0;
            }
            
            @media (prefers-color-scheme: dark) {
              .main-body { background-color: #111827 !important; }
              .main-card { background-color: #1f2937 !important; border-color: #374151 !important; }
              .text-primary { color: #f3f4f6 !important; }
              .text-secondary { color: #9ca3af !important; }
              .otp-container { background-color: #111827 !important; border-color: #374151 !important; }
              .otp-code { color: #60a5fa !important; }
              .warning-box { background-color: #7f1d1d !important; border-color: #991b1b !important; }
              .warning-text { color: #fecaca !important; }
              .logo-light { display: none !important; }
              .logo-dark { display: block !important; }
            }
          `}
        </style>
      </Head>
      <Preview>Your BoardTAU Inquiry Verification Code: {otp}</Preview>
      <Body style={styles.body} className="main-body">
        <Container style={styles.container} className="main-card">
          <Section style={styles.header}>
            <Img
              src={lightLogoUrl}
              height="36"
              alt="BoardTAU"
              style={styles.logoLight}
              className="logo-light"
            />
            {/* Fallback for dark mode in supported clients */}
            <div style={{ display: 'none' }} className="logo-dark">
               <Img
                src={darkLogoUrl}
                height="36"
                alt="BoardTAU"
                style={styles.logoDark}
              />
            </div>
          </Section>

          <Section style={styles.content}>
            <Heading style={styles.title} className="text-primary">
              Verify Your Inquiry
            </Heading>
            
            <Text style={styles.text} className="text-secondary">
              Hi {userName},
            </Text>
            <Text style={styles.text} className="text-secondary">
              To proceed with your inquiry on BoardTAU, please enter the following verification code in the application form. This ensures the host that you are a real applicant.
            </Text>

            <Section style={styles.otpWrapper}>
              <div style={styles.otpContainer} className="otp-container">
                <Text style={styles.otpCode} className="otp-code">
                  {otp}
                </Text>
              </div>
            </Section>

            <Text style={styles.subtext} className="text-secondary">
              This code will expire in 10 minutes. If you did not request this code, you can safely ignore this email.
            </Text>

            <Section style={styles.warningBox} className="warning-box">
              <Text style={styles.warningText} className="warning-text">
                <strong>Security Tip:</strong> BoardTAU personnel and hosts will never ask for your verification code. Do not share it with anyone.
              </Text>
            </Section>
          </Section>

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              &copy; {new Date().getFullYear()} BoardTAU. All rights reserved.
            </Text>
            <Text style={styles.footerText}>
              Your Ultimate Destination Connection
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const styles = {
  body: {
    backgroundColor: '#f3f4f6',
    padding: '40px 0',
  },
  container: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    margin: '0 auto',
    maxWidth: '520px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  header: {
    padding: '32px 32px 24px',
    textAlign: 'center' as const,
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f8fafc',
  },
  logoLight: {
    margin: '0 auto',
  },
  logoDark: {
    margin: '0 auto',
  },
  content: {
    padding: '32px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#111827',
    margin: '0 0 24px',
    textAlign: 'center' as const,
    letterSpacing: '-0.025em',
  },
  text: {
    fontSize: '15px',
    lineHeight: '24px',
    color: '#4b5563',
    margin: '0 0 16px',
  },
  otpWrapper: {
    margin: '32px 0',
  },
  otpContainer: {
    backgroundColor: '#eff6ff',
    border: '2px dashed #93c5fd',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center' as const,
  },
  otpCode: {
    fontSize: '36px',
    fontWeight: '800',
    letterSpacing: '8px',
    color: '#2563eb',
    margin: '0',
    fontFamily: 'monospace',
  },
  subtext: {
    fontSize: '14px',
    lineHeight: '20px',
    color: '#6b7280',
    textAlign: 'center' as const,
    margin: '0 0 24px',
  },
  warningBox: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fca5a5',
    borderRadius: '8px',
    padding: '16px',
  },
  warningText: {
    fontSize: '13px',
    lineHeight: '18px',
    color: '#991b1b',
    margin: '0',
    textAlign: 'center' as const,
  },
  footer: {
    padding: '24px 32px',
    backgroundColor: '#f8fafc',
    borderTop: '1px solid #e5e7eb',
    textAlign: 'center' as const,
  },
  footerText: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: '0 0 4px',
  },
};

export default InquiryOTPEmail;
