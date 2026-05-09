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

interface NewLoginAlertEmailProps {
  userName: string;
  browser: string;
  device: string;
  location?: string;
  time: string;
}

const domain = 'https://boardtau.xyz';

export const NewLoginAlertEmail = ({
  userName = "Valued User",
  browser = "Unknown Browser",
  device = "Unknown Device",
  location = "Unknown Location",
  time = new Date().toLocaleString(),
}: NewLoginAlertEmailProps) => {
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
      <Preview>Security Alert: New Login to BoardTAU</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Img
              src={`${domain}/images/TauBOARD-Light.png`}
              width="180"
              alt="BoardTAU Logo"
              style={{ margin: "0 auto" }}
            />
          </Section>

          <Section style={styles.content}>
            <Heading style={styles.heading}>New Login Detected</Heading>
            <Text style={styles.subtext}>
              Hi {userName}, a new login was detected on your BoardTAU account. We want to make sure it was you.
            </Text>

            <Section style={styles.infoCard}>
              <Text style={styles.label}>Device & Browser</Text>
              <Text style={styles.value}>{browser} on {device}</Text>

              <Text style={styles.label}>Time</Text>
              <Text style={styles.value}>{time}</Text>

              <Text style={{ color: "#ef4444", fontSize: "12px", fontWeight: "700", margin: "16px 0 0" }}>
                Wasn't you?
              </Text>
              <Text style={{ color: "#cbd5e1", fontSize: "12px", lineHeight: "1.5", margin: "4px 0 0" }}>
                If you don't recognize this activity, please reset your password immediately to secure your account.
              </Text>
            </Section>

            <Link href={`${domain}/profile`} style={styles.button}>
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

export default NewLoginAlertEmail;
