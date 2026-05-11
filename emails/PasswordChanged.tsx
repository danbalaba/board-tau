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

interface PasswordChangedEmailProps {
  userName: string;
}

import { lightLogoUrl, baseUrl } from '../services/email/constants';

export const PasswordChangedEmail = ({
  userName = "Valued User",
}: PasswordChangedEmailProps) => {
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
      fontSize: "24px",
      fontWeight: "800",
      letterSpacing: "-0.5px",
      lineHeight: "1.2",
      margin: "0 0 15px",
    },
    subtext: {
      color: "#94a3b8",
      fontSize: "14px",
      lineHeight: "24px",
      margin: "0 0 30px",
    },
    alertCard: {
      backgroundColor: "#0f172a",
      backgroundImage: "linear-gradient(#0f172a, #0f172a)",
      borderRadius: "16px",
      padding: "24px",
      textAlign: "left" as const,
      marginBottom: "30px",
      border: "1px solid #ef444433",
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
      fontSize: "14px",
      fontWeight: "700",
      padding: "14px 32px",
      textDecoration: "none",
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
      <Preview>Security Alert: Your BoardTAU password was changed</Preview>
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
            <Heading style={styles.heading}>Password Successfully Changed</Heading>
            <Text style={styles.subtext}>
              Hi {userName}, this is an automated confirmation that your BoardTAU account password was recently updated.
            </Text>

            <Section style={styles.alertCard}>
              <Text style={{ color: "#ef4444", fontSize: "13px", fontWeight: "800", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "1px" }}>
                Security Notice
              </Text>
              <Text style={{ color: "#cbd5e1", fontSize: "13px", lineHeight: "1.6", margin: "0" }}>
                If you did not make this change, your account may have been compromised. Please reset your password immediately or contact our security team.
              </Text>
            </Section>

            <Link href={`${baseUrl}/auth/login`} style={styles.button}>
              Secure My Account
            </Link>
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

export default PasswordChangedEmail;

