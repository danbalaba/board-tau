import FooterPageLayout from '@/components/layout/FooterPageLayout';

export default function AccessibilitySupportContent() {
  return (
    <FooterPageLayout
      title="Accessibility Statement"
      lastUpdated="May 2026"
    >
      <div className="space-y-6">
        <p>
          At BoardTAU, we are committed to making our website and platform accessible to everyone, including individuals with disabilities. We believe that everyone should have equal access to secure housing options.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Commitment</h2>
        <p>
          We are actively working to increase the accessibility and usability of our website and in doing so adhere to many of the available standards and guidelines. Our goal is to meet the Web Content Accessibility Guidelines (WCAG) 2.1 at the AA level.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Features to Enhance Accessibility</h2>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li><strong>Keyboard Navigation:</strong> Our site is designed to be fully navigable using a keyboard.</li>
          <li><strong>Screen Reader Compatibility:</strong> We use semantic HTML and ARIA labels to ensure compatibility with screen readers.</li>
          <li><strong>Color Contrast:</strong> We have carefully selected our color palette and use a dark/light mode toggle to ensure sufficient contrast for users with visual impairments.</li>
          <li><strong>Scalable Text:</strong> Our layout responds to browser text-sizing options, allowing you to increase the font size without breaking the layout.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Accessibility for Listings</h2>
        <p>
          We encourage all our hosts to clearly describe the accessibility features of their properties. If you have specific accessibility needs (e.g., ground-floor rooms, wheelchair ramps, grab bars), you can use our advanced filtering options to find listings that accommodate those needs. If the listing description is unclear, we recommend messaging the host directly for confirmation before booking.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Feedback and Assistance</h2>
        <p>
          We are constantly working to improve our platform. If you experience any difficulty in accessing any part of this website, or if you have suggestions on how we can improve our accessibility features, please let us know.
        </p>
        <p>
          You can contact our support team directly at <a href="mailto:accessibility@boardtau.com" className="underline font-medium">accessibility@boardtau.com</a>.
        </p>
      </div>
    </FooterPageLayout>
  );
}
