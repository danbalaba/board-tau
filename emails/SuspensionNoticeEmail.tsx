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
import { lightLogoUrl, styles } from '@/services/email/constants';

interface SuspensionNoticeEmailProps {
  userName: string;
  reason: string;
}

export default function SuspensionNoticeEmail({ userName, reason }: SuspensionNoticeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Important: Your BoardTAU account has been suspended.</Preview>
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Img src={lightLogoUrl} alt="BoardTAU Logo" width="160" height="auto" style={styles.logo} />
          </Section>

          <Section style={styles.contentSection}>
            <Heading style={{...styles.heading, color: '#f59e0b'}}>Account Suspended</Heading>
            <Text style={styles.text}>Hello {userName},</Text>
            <Text style={styles.text}>
              We are writing to inform you that your BoardTAU account has been temporarily suspended.
            </Text>
            
            <Section style={styles.infoBox}>
              <Text style={{ ...styles.label, marginBottom: '8px' }}>Reason for Suspension:</Text>
              <Text style={{ ...styles.value, margin: '0', color: '#1f2937' }}>{reason}</Text>
            </Section>

            <Text style={styles.text}>
              During this suspension, you will not be able to log in, send inquiries, or make reservations. If you have any active bookings, they may be subject to cancellation.
            </Text>

            <Text style={styles.text}>
              Please note that if this behavior continues after your suspension is lifted, it may result in a permanent lifetime ban from the platform.
            </Text>

            <Section style={styles.buttonSection}>
              <Button href="mailto:support@boardtau.com" style={{...styles.button, backgroundColor: '#f59e0b', color: '#ffffff'}}>
                Contact Support to Appeal
              </Button>
            </Section>
            
            <Text style={styles.footerText}>
              If you believe this suspension was made in error, please contact our support team to submit an appeal.
            </Text>
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
