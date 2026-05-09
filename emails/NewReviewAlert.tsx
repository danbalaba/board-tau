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

interface NewReviewAlertProps {
  listingTitle: string;
  tenantName: string;
  rating: number;
  comment?: string;
  manageReviewLink: string;
}

const domain = 'https://boardtau.xyz';

export const NewReviewAlert = ({
  listingTitle = "Property",
  tenantName = "Guest",
  rating = 5,
  comment = "",
  manageReviewLink = `${domain}/landlord/reviews`,
}: NewReviewAlertProps) => {
  const stars = "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
  
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
    ratingCard: {
      backgroundColor: "#0f172a",
      backgroundImage: "linear-gradient(#0f172a, #0f172a)",
      borderRadius: "16px",
      border: "1px solid #334155",
      padding: "30px 20px",
      textAlign: "center" as const,
      marginBottom: "30px",
    },
    stars: {
      color: "#fbbf24",
      fontSize: "36px",
      margin: "0 0 10px",
      letterSpacing: "4px",
    },
    commentBox: {
      backgroundColor: "#115e59",
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "30px",
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
      <Preview>{`New ${rating}-Star Review for ${listingTitle}`}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container} className="main-card">
          <Section style={styles.header}>
            <Img src={`${domain}/images/TauBOARD-Light.png`} width="160" alt="BoardTAU" style={{ margin: "0 auto" }} />
          </Section>

          <Section style={styles.content}>
            <Heading style={styles.heading}>New Guest Review</Heading>
            <Text style={styles.label}>Feedback for {listingTitle}</Text>

            <Section style={styles.ratingCard}>
              <Text style={styles.stars}>{stars}</Text>
              <Text style={{ color: "#f8fafc", fontSize: "18px", fontWeight: "800", margin: "0" }}>{rating} / 5.0 Rating</Text>
              <Text style={{ color: "#64748b", fontSize: "13px", marginTop: "4px" }}>By {tenantName}</Text>
            </Section>

            {comment && (
              <Section style={styles.commentBox}>
                <Text style={{ color: "#ffffff", fontSize: "14px", fontStyle: "italic", lineHeight: "1.6", margin: "0" }}>"{comment}"</Text>
              </Section>
            )}

            <Link href={manageReviewLink} style={styles.button}>Read Full Review</Link>
          </Section>

          <Section style={{ backgroundColor: "#0f172a", padding: "30px", textAlign: "center" }}>
            <Text style={{ color: "#475569", fontSize: "10px", margin: "0" }}>© {new Date().getFullYear()} BoardTAU • Camiling, Tarlac, Philippines</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default NewReviewAlert;
