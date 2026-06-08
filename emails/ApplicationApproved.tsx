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
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";

interface ApplicationApprovedProps {
  userName: string;
  dashboardLink: string;
}

import { lightLogoUrl, baseUrl } from '../services/email/constants';

export const ApplicationApproved = ({
  userName = "User",
  dashboardLink = `${baseUrl}/landlord`,
}: ApplicationApprovedProps) => {
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
      fontSize: "26px",
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
    successCard: {
      backgroundColor: "#115e59",
      borderRadius: "16px",
      padding: "24px",
      marginBottom: "30px",
    },
    stepBox: {
      backgroundColor: "#0f172a",
      backgroundImage: "linear-gradient(#0f172a, #0f172a)",
      borderRadius: "16px",
      border: "1px solid #334155",
      padding: "20px",
      marginBottom: "30px",
    },
    label: {
      color: "#ffffff",
      fontSize: "11px",
      fontWeight: "700",
      textTransform: "uppercase" as const,
      letterSpacing: "1px",
      margin: "0 0 8px",
    },
    button: {
      backgroundColor: "#2f7d6d",
      backgroundImage: "linear-gradient(#2f7d6d, #2f7d6d)",
      borderRadius: "10px",
      color: "#ffffff",
      display: "block",
      fontSize: "15px",
      fontWeight: "700",
      padding: "16px",
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
      <Preview>Congratulations! Your Application is Approved!</Preview>
      <Body style={styles.body}>
        <Container style={styles.container} className="main-card">
          <Section style={styles.header}>
            <Img src={lightLogoUrl} width="160" alt="BoardTAU" style={{ margin: "0 auto" }} />
          </Section>

          <Section style={styles.content}>
            <Heading style={styles.heading}>Welcome Aboard!</Heading>
            <Text style={styles.subtext}>Dear {userName}, we are thrilled to inform you that your landlord application has been approved.</Text>

            <Section style={styles.successCard}>
              <Row>
                <Column width="64">
                   <Text style={{ fontSize: "32px", margin: "0" }}>🏆</Text>
                </Column>
                <Column>
                  <Text style={styles.label}>Account Status</Text>
                  <Text style={{ color: "#ffffff", fontSize: "16px", fontWeight: "800", margin: "0" }}>Landlord Verified</Text>
                </Column>
              </Row>
            </Section>

            <Section style={styles.stepBox}>
              <Text style={{ ...styles.label, color: "#64748b" }}>Next Steps</Text>
              <Text style={{ color: "#cbd5e1", fontSize: "13px", lineHeight: "1.6", margin: "0 0 12px" }}>
                1. Access your Dashboard with your current login.
              </Text>
              <Text style={{ color: "#cbd5e1", fontSize: "13px", lineHeight: "1.6", margin: "0 0 12px" }}>
                2. Complete your professional landlord profile.
              </Text>
              <Text style={{ color: "#cbd5e1", fontSize: "13px", lineHeight: "1.6", margin: "0" }}>
                3. Start listing your properties to the BoardTAU community.
              </Text>
            </Section>

            <Link href={dashboardLink} style={styles.button}>Access Landlord Dashboard</Link>
          </Section>

          <Section style={{ backgroundColor: "#0f172a", padding: "30px", textAlign: "center" }}>
            <Text style={{ color: "#475569", fontSize: "10px", margin: "0" }}>© {new Date().getFullYear()} BoardTAU • Camiling, Tarlac, Philippines</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ApplicationApproved;

