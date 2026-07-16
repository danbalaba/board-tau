export const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
export const lightLogoUrl = `${baseUrl}/images/TauBOARD-Light.png`;
export const darkLogoUrl = `${baseUrl}/images/TauBOARD-Dark.png`;

export const styles = {
  main: {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
  },
  container: {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  header: {
    padding: '32px 48px',
    textAlign: 'center' as const,
  },
  logo: {
    margin: '0 auto',
  },
  contentSection: {
    padding: '0 48px',
  },
  heading: {
    fontSize: '24px',
    letterSpacing: '-0.5px',
    lineHeight: '1.3',
    fontWeight: '700',
    color: '#1f2937',
    padding: '17px 0 0',
  },
  text: {
    fontSize: '16px',
    lineHeight: '26px',
    color: '#4b5563',
  },
  infoBox: {
    padding: '24px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    margin: '24px 0',
  },
  label: {
    fontSize: '14px',
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  },
  value: {
    fontSize: '16px',
    color: '#0f172a',
    fontWeight: '500',
  },
  buttonSection: {
    textAlign: 'center' as const,
    marginTop: '32px',
    marginBottom: '32px',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '16px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'block',
    padding: '14px 24px',
    fontWeight: '600',
  },
  hr: {
    borderColor: '#e2e8f0',
    margin: '32px 0',
  },
  footer: {
    textAlign: 'center' as const,
    padding: '0 48px',
  },
  footerText: {
    fontSize: '14px',
    color: '#94a3b8',
    lineHeight: '24px',
  },
};

