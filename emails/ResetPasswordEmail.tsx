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

interface ResetPasswordEmailProps {
  userName: string;
  resetLink: string;
  browser: string;
  device: string;
  ipAddress: string;
}

import { lightLogoUrl, baseUrl } from '../services/email/constants';

export const ResetPasswordEmail = ({
  userName = "Valued User",
  resetLink = "#",
  browser = "Unknown Browser",
  device = "Unknown Device",
  ipAddress = "Unknown IP",
}: ResetPasswordEmailProps) => {
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
      maxWidth: "480px",
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
      margin: "20px 0",
    },
    infoCard: {
      backgroundColor: "#0f172a",
      backgroundImage: "linear-gradient(#0f172a, #0f172a)",
      borderRadius: "16px",
      padding: "24px",
      textAlign: "left" as const,
      marginBottom: "30px",
      border: "1px solid #334155",
    },
    label: {
      color: "#94a3b8",
      fontSize: "11px",
      fontWeight: "800",
      textTransform: "uppercase" as const,
      letterSpacing: "1px",
      margin: "0 0 4px",
    },
    value: {
      color: "#f8fafc",
      fontSize: "14px",
      fontWeight: "600",
      margin: "0 0 16px",
    },
    footer: {
      backgroundColor: "#0f172a",
      backgroundImage: "linear-gradient(#0f172a, #0f172a)",
      borderTop: "1px solid #334155",
      padding: "30px",
      textAlign: "center" as const,
    },
  };

  return (
    <Html>
      <Head>
        <meta name="color-scheme" content="light dark" />
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
      <Preview>Reset your BoardTAU password</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Img
              src={lightLogoUrl}
              width="180"
              alt="BoardTAU Logo"
              style={{ margin: "0 auto" }}
            />
          </Section>

          <Section style={styles.content}>
            <Heading style={styles.heading}>Reset Your Password</Heading>
            <Text style={styles.subtext}>
              Hi {userName}, we received a request to reset your BoardTAU password. Click the button below to choose a new one.
            </Text>

            <Link href={resetLink} style={styles.button}>
              Reset Password
            </Link>

            <Text style={{ ...styles.subtext, fontSize: "12px", marginTop: "10px" }}>
              This link will expire in 15 minutes.
            </Text>

            <Section style={styles.infoCard}>
              <Text style={styles.label}>Requested From</Text>
              <Text style={styles.value}>{browser} on {device}</Text>

              <Text style={styles.label}>IP Address</Text>
              <Text style={styles.value}>{ipAddress}</Text>

              <Text style={{ color: "#cbd5e1", fontSize: "12px", lineHeight: "1.5", margin: "16px 0 0", fontStyle: "italic" }}>
                If you did not request this change, please ignore this email or contact support if you have concerns.
              </Text>
            </Section>
          </Section>

          <Section style={styles.footer}>
            <Text style={{ color: "#475569", fontSize: "10px", margin: "0" }}>
              © {new Date().getFullYear()} BoardTAU • Camiling, Tarlac, Philippines
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ResetPasswordEmail;

