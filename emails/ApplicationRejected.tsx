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

interface ApplicationRejectedProps {
  userName: string;
  reason: string;
}

import { lightLogoUrl, baseUrl } from '../services/email/constants';

export const ApplicationRejected = ({
  userName = "User",
  reason = "Did not meet current requirements.",
}: ApplicationRejectedProps) => {
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
    },
    heading: {
      color: "#f8fafc",
      fontSize: "24px",
      fontWeight: "800",
      letterSpacing: "-0.5px",
      lineHeight: "1.3",
      margin: "0 0 10px",
      textAlign: "center" as const,
    },
    subtext: {
      color: "#94a3b8",
      fontSize: "14px",
      lineHeight: "22px",
      margin: "0 0 30px",
      textAlign: "center" as const,
    },
    reasonCard: {
      backgroundColor: "#450a0a", // Deep red for rejection
      borderRadius: "16px",
      border: "1px solid #7f1d1d",
      padding: "24px",
      marginBottom: "30px",
    },
    label: {
      color: "#fca5a5",
      fontSize: "11px",
      fontWeight: "700",
      textTransform: "uppercase" as const,
      letterSpacing: "1px",
      margin: "0 0 8px",
    },
    value: {
      color: "#fef2f2",
      fontSize: "14px",
      lineHeight: "1.6",
      fontStyle: "italic",
      margin: "0",
    },
    button: {
      backgroundColor: "transparent",
      border: "2px solid #2f7d6d",
      borderRadius: "10px",
      color: "#2f7d6d",
      display: "block",
      fontSize: "15px",
      fontWeight: "700",
      padding: "14px",
      textDecoration: "none",
      textAlign: "center" as const,
    }
  };

  return (
    <Html>
      <Head>
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <style>{`
          :root { color-scheme: light dark; supported-color-schemes: light dark; }
          @media (prefers-color-scheme: dark) {
            body { background-color: #0f172a !important; background-image: linear-gradient(#0f172a, #0f172a) !important; }
            .main-card { background-color: #1e293b !important; background-image: linear-gradient(#1e293b, #1e293b) !important; }
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
        />
        <Font
          fontFamily="Outfit"
          fallbackFontFamily="Verdana"
          webFont={{
            url: "https://fonts.gstatic.com/s/outfit/v11/QGYsz_OBy1q8G0uzm17X5fE.woff2",
            format: "woff2",
          }}
          fontWeight={800}
        />
      </Head>
      <Preview>Update regarding your BoardTAU application</Preview>
      <Body style={styles.body}>
        <Container style={styles.container} className="main-card">
          <Section style={styles.header}>
            <Img src={lightLogoUrl} width="160" alt="BoardTAU" style={{ margin: "0 auto" }} />
          </Section>

          <Section style={styles.content}>
            <Heading style={styles.heading}>Application Update</Heading>
            <Text style={styles.subtext}>Dear {userName}, we regret to inform you that your landlord application has been declined.</Text>

            <Section style={styles.reasonCard}>
              <Text style={styles.label}>Reason for Decision</Text>
              <Text style={styles.value}>"{reason}"</Text>
            </Section>

            <Text style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: "1.6", marginBottom: "30px" }}>
              If you believe this decision was made in error or have additional documentation to provide, please contact our support team. We appreciate your interest in BoardTAU.
            </Text>

            <Link href={`${baseUrl}/help`} style={styles.button}>Contact Support Team</Link>
          </Section>

          <Section style={{ backgroundColor: "#0f172a", padding: "30px", textAlign: "center" }}>
            <Text style={{ color: "#475569", fontSize: "10px", margin: "0" }}>© {new Date().getFullYear()} BoardTAU • Camiling, Tarlac, Philippines</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ApplicationRejected;

