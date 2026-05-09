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

interface GenericNotificationProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionLink?: string;
}

const domain = 'https://boardtau.xyz';

export const GenericNotification = ({
  title = "Notification",
  description = "You have a new update from BoardTAU.",
  actionLabel,
  actionLink,
}: GenericNotificationProps) => {
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
      padding: "50px 40px",
      textAlign: "center" as const,
    },
    heading: {
      color: "#f8fafc",
      fontSize: "26px",
      fontWeight: "800",
      letterSpacing: "-0.5px",
      lineHeight: "1.3",
      margin: "0 0 20px",
    },
    description: {
      color: "#cbd5e1",
      fontSize: "16px",
      lineHeight: "26px",
      margin: "0 0 40px",
    },
    button: {
      backgroundColor: "#2f7d6d",
      backgroundImage: "linear-gradient(#2f7d6d, #2f7d6d)",
      borderRadius: "10px",
      color: "#ffffff",
      display: "inline-block",
      fontSize: "16px",
      fontWeight: "700",
      padding: "16px 40px",
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
      <Preview>{title}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container} className="main-card">
          <Section style={styles.header}>
            <Img src={`${domain}/images/TauBOARD-Light.png`} width="160" alt="BoardTAU" style={{ margin: "0 auto" }} />
          </Section>

          <Section style={styles.content}>
            <Heading style={styles.heading}>{title}</Heading>
            <Text style={styles.description}>{description}</Text>

            {actionLabel && actionLink && (
              <Link href={actionLink} style={styles.button}>{actionLabel}</Link>
            )}
          </Section>

          <Section style={{ backgroundColor: "#0f172a", padding: "30px", textAlign: "center" }}>
            <Text style={{ color: "#475569", fontSize: "10px", margin: "0" }}>© {new Date().getFullYear()} BoardTAU • Camiling, Tarlac, Philippines</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default GenericNotification;
