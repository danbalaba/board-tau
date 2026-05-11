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
import { lightLogoUrl, baseUrl } from '../services/email/constants';

interface OAuthReminderEmailProps {
  userName: string;
  provider: string; // 'Google' or 'Facebook'
}

export const OAuthReminderEmail = ({
  userName = "Valued User",
  provider = "Google",
}: OAuthReminderEmailProps) => {
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
      padding: "40px",
      textAlign: "center" as const,
    },
    content: {
      padding: "40px",
      textAlign: "center" as const,
    },
    heading: {
      color: "#f8fafc",
      fontSize: "24px",
      fontWeight: "800",
      letterSpacing: "-0.5px",
      lineHeight: "1.3",
      margin: "0 0 15px",
    },
    subtext: {
      color: "#94a3b8",
      fontSize: "14px",
      lineHeight: "24px",
      margin: "0 0 30px",
    },
    providerBadge: {
      backgroundColor: "#0f172a",
      borderRadius: "16px",
      padding: "24px",
      marginBottom: "30px",
      border: "1px solid #334155",
    },
    button: {
      backgroundColor: "#2f7d6d",
      borderRadius: "10px",
      color: "#ffffff",
      display: "inline-block",
      fontSize: "15px",
      fontWeight: "700",
      padding: "16px 32px",
      textDecoration: "none",
    },
    footer: {
      padding: "30px",
      textAlign: "center" as const,
    }
  };

  return (
    <Html>
      <Head>
        <Font
          fontFamily="Outfit"
          fallbackFontFamily="Verdana"
          webFont={{
            url: "https://fonts.gstatic.com/s/outfit/v11/QGYsz_OBy1q8G0uzm17X5fE.woff2",
            format: "woff2",
          }}
          fontWeight={400}
        />
      </Head>
      <Preview>Quick Reminder: Login with {provider}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Img src={lightLogoUrl} width="160" alt="BoardTAU" style={{ margin: "0 auto" }} />
          </Section>

          <Section style={styles.content}>
            <Heading style={styles.heading}>Account Login Reminder</Heading>
            <Text style={styles.subtext}>
              Hi {userName}, we received a request to reset your password. However, your BoardTAU account is currently linked with your <strong>{provider}</strong> profile.
            </Text>

            <Section style={styles.providerBadge}>
              <Text style={{ color: "#f8fafc", fontSize: "16px", fontWeight: "700", margin: "0 0 8px" }}>
                No Password Required
              </Text>
              <Text style={{ color: "#94a3b8", fontSize: "13px", margin: "0" }}>
                Since you use {provider} to sign in, you don't need a separate password for BoardTAU. Just click the button below to log in instantly.
              </Text>
            </Section>

            <Link href={`${baseUrl}/`} style={styles.button}>
              Go to BoardTAU to Login
            </Link>

            <Text style={{ color: "#475569", fontSize: "12px", marginTop: "30px", fontStyle: "italic" }}>
              Note: If you'd like to use a traditional email and password instead, you can set one up in your Profile Settings after logging in.
            </Text>
          </Section>

          <Section style={styles.footer}>
            <Text style={{ color: "#475569", fontSize: "10px", margin: "0" }}>
              © {new Date().getFullYear()} BoardTAU • Security Notification
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default OAuthReminderEmail;
