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

import { PartyPopper, Mail, XCircle } from "lucide-react";

interface InquiryStatusUpdateProps {
  tenantName: string;
  listingTitle: string;
  status: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  actionLink: string;
}

const domain = 'https://boardtau.xyz';

export const InquiryStatusUpdate = ({
  tenantName = "Guest",
  listingTitle = "Property",
  status = 'APPROVED',
  rejectionReason = "",
  actionLink = `${domain}/inquiries`,
}: InquiryStatusUpdateProps) => {
  const isApproved = status === 'APPROVED';
  
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
      backgroundColor: isApproved ? "#115e59" : "#450a0a",
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
    statusCard: {
      backgroundColor: isApproved ? "#115e59" : "#450a0a",
      borderRadius: "16px",
      padding: "24px",
      marginBottom: "30px",
      textAlign: "center" as const,
    },
    label: {
      color: "#94a3b8",
      fontSize: "11px",
      fontWeight: "700",
      textTransform: "uppercase" as const,
      letterSpacing: "1px",
      margin: "0 0 15px",
      textAlign: "center" as const,
    },
    button: {
      backgroundColor: isApproved ? "#2f7d6d" : "#1e293b",
      backgroundImage: isApproved ? "linear-gradient(#2f7d6d, #2f7d6d)" : "linear-gradient(#1e293b, #1e293b)",
      border: isApproved ? "none" : "1px solid #334155",
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
      <Preview>Inquiry {isApproved ? 'Approved' : 'Update'} for {listingTitle}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container} className="main-card">
          <Section style={styles.header}>
            <Img src={`${domain}/images/TauBOARD-Light.png`} width="160" alt="BoardTAU" style={{ margin: "0 auto" }} />
          </Section>

          <Section style={styles.content}>
            <Heading style={styles.heading}>Inquiry {isApproved ? 'Approved!' : 'Update'}</Heading>
            <Text style={styles.label}>Regarding {listingTitle}</Text>

            <Section style={styles.statusCard}>
               <Row>
                <Column width="64">
                   <div style={{
                     backgroundColor: "rgba(255, 255, 255, 0.1)",
                     borderRadius: "12px",
                     width: "48px",
                     height: "48px",
                     display: "table-cell",
                     verticalAlign: "middle",
                     textAlign: "center" as const,
                   }}>
                    {isApproved ? (
                      <PartyPopper size={24} color="#ffffff" style={{ display: "inline-block", verticalAlign: "middle" }} />
                    ) : (
                      <Mail size={24} color="#ffffff" style={{ display: "inline-block", verticalAlign: "middle" }} />
                    )}
                   </div>
                </Column>
                <Column>
                  <Text style={{ color: "#ffffff", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", margin: "0", textAlign: "left" }}>Status</Text>
                  <Text style={{ color: "#ffffff", fontSize: "18px", fontWeight: "800", margin: "0", textAlign: "left" }}>{isApproved ? 'Ready for Booking' : 'Review Completed'}</Text>
                </Column>
              </Row>
            </Section>

            {isApproved ? (
              <Text style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: "1.6", marginBottom: "30px", textAlign: "center" }}>
                Great news, {tenantName}! Your inquiry has been approved by the landlord. You can now proceed to secure your slot by paying the reservation fee.
              </Text>
            ) : (
              <Section style={{ marginBottom: "30px" }}>
                 <Text style={{ color: "#cbd5e1", fontSize: "14px", lineHeight: "1.6", marginBottom: "15px", textAlign: "center" }}>
                  The landlord has reviewed your inquiry for {listingTitle}. Unfortunately, they cannot accommodate your request at this time.
                </Text>
                {rejectionReason && (
                   <Section style={{ backgroundColor: "#0f172a", borderRadius: "12px", padding: "16px", border: "1px dashed #7f1d1d" }}>
                    <Text style={{ ...styles.label, color: "#fca5a5", textAlign: "left", marginBottom: "8px" }}>Reason</Text>
                    <Text style={{ color: "#fca5a5", fontSize: "13px", fontStyle: "italic", margin: "0" }}>"{rejectionReason}"</Text>
                  </Section>
                )}
              </Section>
            )}

            <Link href={actionLink} style={styles.button}>{isApproved ? 'Secure My Slot' : 'View Details'}</Link>
          </Section>

          <Section style={{ backgroundColor: "#0f172a", padding: "30px", textAlign: "center" }}>
            <Text style={{ color: "#475569", fontSize: "10px", margin: "0" }}>© {new Date().getFullYear()} BoardTAU • Camiling, Tarlac, Philippines</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default InquiryStatusUpdate;
