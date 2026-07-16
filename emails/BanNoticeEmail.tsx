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

// Use your live domain for images
import { lightLogoUrl, baseUrl } from "../services/email/constants";

interface BanNoticeEmailProps {
  userName: string;
  reason: string;
}

export const BanNoticeEmail = ({
  userName = "User",
  reason = "Accumulating 3 strikes due to repeated policy violations.",
}: BanNoticeEmailProps) => {
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
      backgroundColor: "#991b1b", // Deep red ban color
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
    strikeBox: {
      backgroundColor: "#0f172a",
      backgroundImage: "linear-gradient(#0f172a, #0f172a)",
      border: "2px solid #991b1b",
      borderRadius: "16px",
      margin: "0 0 30px",
      padding: "25px 20px",
    },
    strikeText: {
      color: "#ef4444",
      fontSize: "28px",
      fontWeight: "900",
      letterSpacing: "1px",
      lineHeight: "1.2",
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
      backgroundColor: "#991b1b",
      backgroundImage: "linear-gradient(#991b1b, #991b1b)",
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
          @media (prefers-color-scheme: dark) {
            body { 
              background-color: #0f172a !important; 
              background-image: linear-gradient(#0f172a, #0f172a) !important;
            }
            .main-card { 
              background-color: #1e293b !important; 
              background-image: linear-gradient(#1e293b, #1e293b) !important;
            }
          }
        `}</style>
        <Font
          fontFamily="Outfit"
          fallbackFontFamily="Verdana"
          webFont={{ url: "https://fonts.gstatic.com/s/outfit/v11/QGYsz_OBy1q8G0uzm17X5fE.woff2", format: "woff2" }}
          fontWeight={400} fontStyle="normal"
        />
        <Font
          fontFamily="Outfit"
          fallbackFontFamily="Verdana"
          webFont={{ url: "https://fonts.gstatic.com/s/outfit/v11/QGYsz_OBy1q8G0uzm17X5fE.woff2", format: "woff2" }}
          fontWeight={800} fontStyle="normal"
        />
      </Head>
      <Preview>Account Banned: BoardTAU Security Notice</Preview>
      <Body style={styles.body} className="main-body">
        <Container style={styles.container} className="main-card">
          <Section style={styles.header}>
            <Img src={lightLogoUrl} width="180" alt="BoardTAU Logo" style={{ margin: "0 auto" }} />
          </Section>
          <Section style={styles.content}>
            <Heading style={styles.heading}>Account Permanently Banned</Heading>
            <Text style={styles.subtext}>
              Hi {userName}, this email is to notify you that your BoardTAU account has been permanently restricted from our platform.
            </Text>

            <Section style={styles.strikeBox}>
              <Text style={{ color: "#475569", fontSize: "11px", fontWeight: "700", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px", marginTop: "0" }}>
                Status Updates
              </Text>
              <Text style={styles.strikeText}>Access Revoked</Text>
              <Text style={{ color: "#94a3b8", fontSize: "11px", fontWeight: "700", letterSpacing: "1px", textTransform: "uppercase", marginTop: "12px", marginBottom: "0" }}>
                This decision is final and cannot be reversed.
              </Text>
            </Section>

            <Section style={styles.messageCard}>
              <Text style={{ color: "#f8fafc", fontSize: "13px", fontWeight: "700", margin: "0 0 8px" }}>
                Reason for Ban:
              </Text>
              <Text style={{ color: "#cbd5e1", fontSize: "13px", lineHeight: "1.5", margin: "0" }}>
                {reason}
              </Text>
            </Section>

            <Link href="mailto:support@boardtau.com" style={styles.button}>
              Contact Support
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

export default BanNoticeEmail;
