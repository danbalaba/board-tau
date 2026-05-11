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

interface InquiryReceiptProps {
  tenantName: string;
  listingTitle: string;
  roomName: string;
  roomImage?: string;
  moveInDate: string;
  checkOutDate: string;
  monthlyPrice: number;
  occupantsCount: number;
  reservationFee: number;
  baseFee: number;
  message?: string;
  trackInquiryLink: string;
}

import { lightLogoUrl, baseUrl } from '../services/email/constants';

export const InquiryReceipt = ({
  tenantName = "Guest",
  listingTitle = "Listing",
  roomName = "Room",
  roomImage = `${baseUrl}/images/placeholder.jpg`,
  moveInDate = "TBD",
  checkOutDate = "TBD",
  monthlyPrice = 0,
  occupantsCount = 1,
  reservationFee = 0,
  baseFee = 0,
  message = "",
  trackInquiryLink = `${baseUrl}/inquiries`,
}: InquiryReceiptProps) => {
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
    infoGrid: {
      backgroundColor: "#0f172a",
      backgroundImage: "linear-gradient(#0f172a, #0f172a)",
      borderRadius: "16px",
      border: "1px solid #334155",
      padding: "24px",
      marginBottom: "30px",
    },
    label: {
      color: "#64748b",
      fontSize: "11px",
      fontWeight: "700",
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
      <Preview>Inquiry Receipt: {listingTitle}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container} className="main-card">
          <Section style={styles.header}>
            <Img src={lightLogoUrl} width="160" alt="BoardTAU" style={{ margin: "0 auto" }} />
          </Section>

          <Section style={styles.content}>
            <Heading style={styles.heading}>Inquiry Received</Heading>
            <Text style={styles.subtext}>Hi {tenantName}, we've sent your inquiry to the landlord. Here's a copy of your request.</Text>

            <Img src={roomImage} width="100%" height="180" style={{ borderRadius: "12px", objectFit: "cover", marginBottom: "30px" }} alt="Room" />

            <Section style={styles.infoGrid}>
              <Row style={{ marginBottom: "16px" }}>
                <Column>
                  <Text style={styles.label}>Property</Text>
                  <Text style={styles.value}>{listingTitle}</Text>
                </Column>
                <Column>
                  <Text style={styles.label}>Room</Text>
                  <Text style={styles.value}>{roomName}</Text>
                </Column>
              </Row>
              <Row>
                <Column>
                  <Text style={styles.label}>Move-In Date</Text>
                  <Text style={styles.value}>{moveInDate}</Text>
                </Column>
                <Column>
                  <Text style={styles.label}>Occupants</Text>
                  <Text style={styles.value}>{occupantsCount} Person(s)</Text>
                </Column>
              </Row>
              <Section style={{ borderTop: "1px solid #334155", paddingTop: "16px", marginTop: "10px" }}>
                <Row style={{ marginBottom: "4px" }}>
                  <Column>
                    <Text style={{ 
                      color: "#64748b", 
                      fontSize: "10px", 
                      fontWeight: "700", 
                      textTransform: "uppercase",
                      margin: "0" 
                    }}>
                      Breakdown
                    </Text>
                  </Column>
                  <Column style={{ textAlign: "right" }}>
                    <Text style={{ 
                      color: "#64748b", 
                      fontSize: "10px", 
                      fontWeight: "700",
                      margin: "0" 
                    }}>
                      {occupantsCount} {occupantsCount === 1 ? 'Person' : 'Persons'} × ₱{baseFee.toLocaleString()}
                    </Text>
                  </Column>
                </Row>
                <Row>
                  <Column><Text style={{ ...styles.label, color: "#2f7d6d" }}>Total Reservation Fee</Text></Column>
                  <Column><Text style={{ ...styles.value, color: "#2f7d6d", textAlign: "right" }}>₱{reservationFee.toLocaleString()}</Text></Column>
                </Row>
              </Section>
            </Section>

            {message && (
              <Section style={{ backgroundColor: "#0f172a", borderRadius: "12px", padding: "16px", marginBottom: "30px", border: "1px dashed #334155" }}>
                <Text style={styles.label}>Your Message</Text>
                <Text style={{ color: "#cbd5e1", fontSize: "13px", fontStyle: "italic", margin: "0" }}>"{message}"</Text>
              </Section>
            )}

            <Link href={trackInquiryLink} style={styles.button}>Track My Inquiry</Link>
          </Section>

          <Section style={{ backgroundColor: "#0f172a", padding: "30px", textAlign: "center" }}>
            <Text style={{ color: "#475569", fontSize: "10px", margin: "0" }}>© {new Date().getFullYear()} BoardTAU • Camiling, Tarlac, Philippines</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default InquiryReceipt;

