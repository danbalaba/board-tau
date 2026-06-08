import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Font,
} from "@react-email/components";
import * as React from "react";

interface OTPEmailProps {
  otp: string;
}

// Use your live domain for images
import { lightLogoUrl, baseUrl } from "../services/email/constants";

export const OTPEmail = ({
  otp = "000000",
}: OTPEmailProps) => {
  const styles = {
    body: {
      backgroundColor: "#0f172a",
      margin: "0 auto",
      padding: "40px 20px",
    },
    container: {
      backgroundColor: "#1e293b",
      border: "1px solid #334155",
      borderRadius: "24px",
      margin: "0 auto",
      maxWidth: "480px", // Reduced width for a sleeker look
      overflow: "hidden",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    },
    header: {
      backgroundColor: "#115e59",
      padding: "40px 40px",
      textAlign: "center" as const,
    },
    content: {
      padding: "40px 40px",
      textAlign: "center" as const,
    },
    heading: {
      color: "#f8fafc",
      fontSize: "28px",
      fontWeight: "800",
      letterSpacing: "-1px",
      lineHeight: "1.2",
      margin: "0 0 15px",
    },
    subtext: {
      color: "#94a3b8",
      fontSize: "14px",
      lineHeight: "24px",
      margin: "0 0 30px",
    },
    otpBox: {
      backgroundColor: "#0f172a",
      backgroundImage: "linear-gradient(#0f172a, #0f172a)", // Gradient trick to prevent inversion
      border: "2px solid #2f7d6d",
      borderRadius: "16px",
      margin: "0 0 30px",
      padding: "35px 20px",
    },
    otpText: {
      color: "#2f7d6d",
      fontSize: "52px",
      fontWeight: "900",
      letterSpacing: "12px",
      lineHeight: "1",
      margin: "0",
    },
    messageCard: {
      backgroundColor: "#0f172a",
      backgroundImage: "linear-gradient(#0f172a, #0f172a)",
      borderRadius: "12px",
      padding: "20px",
      textAlign: "left" as const,
      marginBottom: "30px",
    },
    footer: {
      backgroundColor: "#0f172a",
      backgroundImage: "linear-gradient(#0f172a, #0f172a)",
      borderTop: "1px solid #334155",
      padding: "30px",
      textAlign: "center" as const,
    },
    button: {
      backgroundColor: "#2f7d6d",
      backgroundImage: "linear-gradient(#2f7d6d, #2f7d6d)",
      borderRadius: "10px",
      color: "#ffffff",
      display: "inline-block",
      fontSize: "15px",
      fontWeight: "700",
      padding: "14px 32px",
      textDecoration: "none",
    },
    socialIcon: {
      display: "inline-block",
      margin: "0 8px",
    }
  };

  return (
    <Html>
      <Head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <style>{`
          :root {
            color-scheme: light dark;
            supported-color-schemes: light dark;
          }
          /* iOS Dark Mode Fix - Prevent Inversion */
          @media (prefers-color-scheme: dark) {
            body { 
              background-color: #0f172a !important; 
              background-image: linear-gradient(#0f172a, #0f172a) !important;
            }
            .main-card { 
              background-color: #1e293b !important; 
              background-image: linear-gradient(#1e293b, #1e293b) !important;
            }
            .text-fslate { color: #f8fafc !important; }
            .text-slate-400 { color: #94a3b8 !important; }
          }
        `}</style>
        <Font
          fontFamily="Outfit"
          fallbackFontFamily="Verdana"
          webFont={{
            url: "https://fonts.gstatic.com/s/outfit/v11/QGYsz_OBy1q8G0uzm17X5fE.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Outfit"
          fallbackFontFamily="Verdana"
          webFont={{
            url: "https://fonts.gstatic.com/s/outfit/v11/QGYsz_OBy1q8G0uzm17X5fE.woff2",
            format: "woff2",
          }}
          fontWeight={800}
          fontStyle="normal"
        />
      </Head>
      <Preview>BoardTAU Security Code: {otp}</Preview>
      <Body style={styles.body} className="main-body">
        <Container style={styles.container} className="main-card">
          {/* Header */}
          <Section style={styles.header}>
            <Img
              src={lightLogoUrl}
              width="180"
              alt="BoardTAU Logo"
              style={{ margin: "0 auto" }}
            />
          </Section>

          {/* Main Content */}
          <Section style={styles.content}>
            <Heading style={styles.heading}>Security Verification</Heading>
            <Text style={styles.subtext}>
              Enter the code below in the verification screen to securely access your account.
            </Text>

            <Section style={styles.otpBox}>
              <Text style={styles.otpText}>{otp}</Text>
              <Text style={{ color: "#475569", fontSize: "11px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", marginTop: "12px" }}>
                Valid for 10 minutes
              </Text>
            </Section>

            <Section style={styles.messageCard}>
              <Text style={{ color: "#f8fafc", fontSize: "13px", fontWeight: "700", margin: "0 0 8px" }}>
                Identity Request
              </Text>
              <Text style={{ color: "#cbd5e1", fontSize: "13px", lineHeight: "1.5", margin: "0" }}>
                A request was made to access your BoardTAU account. If this was not you, please secure your account immediately.
              </Text>
            </Section>

            <Link href={baseUrl} style={styles.button}>
              Complete Login
            </Link>
          </Section>

          {/* Footer & Socials */}
          <Section style={styles.footer}>
            <Section style={{ marginBottom: "15px" }}>
              <Link href="https://facebook.com/boardtau" style={styles.socialIcon}>
                <Img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="20" height="20" alt="FB" />
              </Link>
              <Link href="https://twitter.com/boardtau" style={styles.socialIcon}>
                <Img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" width="20" height="20" alt="TW" />
              </Link>
              <Link href="https://instagram.com/boardtau" style={styles.socialIcon}>
                <Img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="20" height="20" alt="IG" />
              </Link>
            </Section>

            <Text style={{ color: "#475569", fontSize: "10px", margin: "0" }}>
              © {new Date().getFullYear()} BoardTAU • Camiling, Tarlac, Philippines
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default OTPEmail;





