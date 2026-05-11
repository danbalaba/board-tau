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

interface ReservationFeeNotificationProps {
  landlordName: string;
  tenantName: string;
  listingTitle: string;
  amount: number;
  manageLink: string;
}

import { lightLogoUrl, baseUrl } from '../services/email/constants';

export const ReservationFeeNotification = ({
  landlordName = "Landlord",
  tenantName = "Student",
  listingTitle = "Property",
  amount = 0,
  manageLink = `${baseUrl}/landlord/reservations`,
}: ReservationFeeNotificationProps) => {
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
    paymentCard: {
      backgroundColor: "#0f172a",
      backgroundImage: "linear-gradient(#0f172a, #0f172a)",
      borderRadius: "16px",
      border: "1px solid #334155",
      padding: "30px 20px",
      textAlign: "center" as const,
      marginBottom: "30px",
    },
    amount: {
      color: "#2f7d6d",
      fontSize: "48px",
      fontWeight: "900",
      margin: "0",
      lineHeight: "1",
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
      <Preview>Reservation Payment Received for {listingTitle}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container} className="main-card">
          <Section style={styles.header}>
            <Img src={lightLogoUrl} width="160" alt="BoardTAU" style={{ margin: "0 auto" }} />
          </Section>

          <Section style={styles.content}>
            <Heading style={styles.heading}>Reservation Secured</Heading>
            <Text style={{ ...styles.label, textAlign: "center", marginBottom: "30px" }}>Payment Confirmation</Text>

            <Section style={styles.paymentCard}>
              <Text style={{ color: "#94a3b8", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", marginBottom: "10px" }}>Amount Paid</Text>
              <Text style={styles.amount}>₱{amount.toLocaleString()}</Text>
              <Text style={{ color: "#2f7d6d", fontSize: "12px", fontWeight: "700", marginTop: "10px" }}>Success • Confirmed</Text>
            </Section>

            <Section style={{ marginBottom: "30px" }}>
               <Row style={{ marginBottom: "16px" }}>
                <Column>
                  <Text style={styles.label}>Tenant</Text>
                  <Text style={styles.value}>{tenantName}</Text>
                </Column>
                <Column>
                  <Text style={styles.label}>Property</Text>
                  <Text style={styles.value}>{listingTitle}</Text>
                </Column>
              </Row>
            </Section>

            <Text style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: "1.6", marginBottom: "30px", textAlign: "center" }}>
              The slot is now officially reserved for the tenant. You can view all documentation and manage the reservation in your landlord dashboard.
            </Text>

            <Link href={manageLink} style={styles.button}>Manage Reservation</Link>
          </Section>

          <Section style={{ backgroundColor: "#0f172a", padding: "30px", textAlign: "center" }}>
            <Text style={{ color: "#475569", fontSize: "10px", margin: "0" }}>© {new Date().getFullYear()} BoardTAU • Camiling, Tarlac, Philippines</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default ReservationFeeNotification;

