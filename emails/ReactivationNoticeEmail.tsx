import React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Img,
  Link,
  Hr,
  Button
} from '@react-email/components';
import { baseUrl, lightLogoUrl, styles } from '@/services/email/constants';

interface ReactivationNoticeEmailProps {
  userName: string;
}

export default function ReactivationNoticeEmail({ userName }: ReactivationNoticeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your BoardTAU account has been reactivated!</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Img src={lightLogoUrl} alt="BoardTAU Logo" width="160" height="auto" style={styles.logo} />
          </Section>

          <Section style={styles.contentSection}>
            <Heading style={{...styles.heading, color: '#10b981'}}>Account Reactivated</Heading>
            <Text style={styles.text}>Welcome back, {userName}!</Text>
            <Text style={styles.text}>
              We are pleased to inform you that your BoardTAU account has been successfully reactivated by our administration team.
            </Text>

            <Text style={styles.text}>
              You now have full access to the platform again. You can log in, browse listings, send inquiries, and manage your reservations.
            </Text>

            <Section style={{ ...styles.infoBox, backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
              <Text style={{ ...styles.text, margin: '0', color: '#166534', fontWeight: 'bold' }}>
                Please take a moment to review our Community Standards and Safety Guidelines to ensure a great experience for everyone.
              </Text>
            </Section>

            <Section style={styles.buttonSection}>
              <Button href={`${baseUrl}/auth/login`} style={{...styles.button, backgroundColor: '#10b981', color: '#ffffff'}}>
                Log In to BoardTAU
              </Button>
            </Section>
            
          </Section>

          <Hr style={styles.hr} />
          
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              BoardTAU Security Protocol
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
