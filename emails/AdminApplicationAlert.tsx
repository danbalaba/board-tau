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

interface AdminApplicationAlertProps {
  adminName: string;
  applicationId: string;
  applicantName: string;
  businessName: string;
  propertyName: string;
  email: string;
  phone: string;
  reviewLink: string;
}

import { lightLogoUrl, baseUrl } from "../services/email/constants";

export const AdminApplicationAlert = ({
  adminName = "Admin",
  applicationId = "ID",
  applicantName = "Applicant",
  businessName = "Business",
  propertyName = "Property",
  email = "email@example.com",
  phone = "09000000000",
  reviewLink = `${baseUrl}/admin/applications`,
}: AdminApplicationAlertProps) => {
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
    adminGrid: {
      backgroundColor: "#0f172a",
      backgroundImage: "linear-gradient(#0f172a, #0f172a)",
      borderRadius: "16px",
      border: "1px solid #334155",
      padding: "24px",
      marginBottom: "30px",
    },
    label: {
      color: "#64748b",
      fontSize: "10px",
      fontWeight: "700",
      textTransform: "uppercase" as const,
      letterSpacing: "1px",
      margin: "0 0 4px",
    },
    value: {
      color: "#f8fafc",
      fontSize: "13px",
      fontWeight: "600",
      margin: "0 0 16px",
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
      <Preview>New Landlord Application: {applicantName}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container} className="main-card">
          <Section style={styles.header}>
            <Img src={lightLogoUrl} width="160" alt="BoardTAU" style={{ margin: "0 auto" }} />
          </Section>

          <Section style={styles.content}>
            <Heading style={styles.heading}>Action Required</Heading>
            <Text style={styles.subtext}>A new landlord application has been submitted and requires administrative review.</Text>

            <Section style={styles.adminGrid}>
              <Row>
                <Column>
                  <Text style={styles.label}>Applicant Name</Text>
                  <Text style={styles.value}>{applicantName}</Text>
                </Column>
                <Column>
                  <Text style={styles.label}>Application ID</Text>
                  <Text style={styles.value}>{applicationId}</Text>
                </Column>
              </Row>
              <Row>
                <Column>
                  <Text style={styles.label}>Business</Text>
                  <Text style={styles.value}>{businessName}</Text>
                </Column>
                <Column>
                  <Text style={styles.label}>Property</Text>
                  <Text style={styles.value}>{propertyName}</Text>
                </Column>
              </Row>
              <Section style={{ borderTop: "1px solid #334155", paddingTop: "16px", marginTop: "10px" }}>
                <Text style={styles.label}>Contact Email</Text>
                <Text style={styles.value}>{email}</Text>
                <Text style={styles.label}>Contact Phone</Text>
                <Text style={{ ...styles.value, margin: "0" }}>{phone}</Text>
              </Section>
            </Section>

            <Link href={reviewLink} style={styles.button}>Review Application</Link>
          </Section>

          <Section style={{ backgroundColor: "#0f172a", padding: "20px", textAlign: "center" }}>
            <Text style={{ color: "#475569", fontSize: "10px", margin: "0" }}>System Notification • BoardTAU</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default AdminApplicationAlert;
