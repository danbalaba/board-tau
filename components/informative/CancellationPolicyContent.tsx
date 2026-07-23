"use client";
import FooterPageLayout from '@/components/layout/FooterPageLayout';
import { motion } from 'framer-motion';

export default function CancellationPolicyContent() {
  return (
    <FooterPageLayout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="space-y-6"
      >
        <p>
          We understand that plans can change. BoardTAU provides a clear and standardized cancellation policy to protect both our students and our hosts. Please review these terms carefully before making a reservation.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Standard Cancellation Policy</h2>
        <p>
          Unless a host has specified a strict custom policy on their listing, the following standard rules apply to all reservations made through BoardTAU:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li><strong>Full Refund:</strong> If a guest cancels at least 14 days before the agreed-upon move-in date, they will receive a 100% refund of the reservation fee.</li>
          <li><strong>Partial Refund:</strong> If a guest cancels between 7 and 14 days before the move-in date, they will receive a 50% refund of the reservation fee.</li>
          <li><strong>No Refund:</strong> If a guest cancels less than 7 days before the move-in date, the reservation fee is non-refundable, serving as compensation to the host for holding the room.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Host Cancellations</h2>
        <p>
          Hosts are expected to honor all confirmed reservations. In the rare event that a host must cancel a booking:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li>The guest will immediately receive a 100% refund.</li>
          <li>Our support team will proactively reach out to the guest to help them find alternative accommodation near TAU.</li>
          <li>Hosts who cancel frequently or without a valid emergency reason may face penalties, including the suspension of their listing.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">Extenuating Circumstances</h2>
        <p>
          BoardTAU may override the standard cancellation policy and issue a full refund in cases of unforeseeable and unavoidable events, such as:
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-4">
          <li>Severe weather emergencies or natural disasters in Tarlac Province.</li>
          <li>Sudden university closures or major shifts to remote learning mandated by TAU.</li>
          <li>Documented severe medical emergencies.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">How to Cancel</h2>
        <p>
          To cancel a reservation, navigate to your "My Reservations" page in your dashboard, select the booking, and click "Cancel Reservation." The refund amount will be automatically calculated based on the policy timeline.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4 text-rose-600">Cancellation Abuse & Spam Policy</h2>
        <p>
          To protect landlords from malicious behavior, BoardTAU strictly prohibits the spamming of inquiries and reservations. 
        </p>
        <ul className="list-disc pl-6 space-y-2 mt-4 border-l-2 border-rose-500 pl-4 bg-rose-50/50 p-4 rounded-r-xl">
          <li><strong>The 3-Strike Rule:</strong> Users who repeatedly cancel inquiries or reservations will accumulate strikes. Reaching 3 strikes results in an automatic account suspension.</li>
          <li><strong>Forfeiture of Fees:</strong> If your account is suspended or banned for violating community guidelines (including cancellation spam), any active un-started reservations will be forcefully cancelled. <strong>You will forfeit any reservation fees paid</strong>, and the landlord will retain the fee as compensation.</li>
          <li><strong>Repeat Offenses:</strong> Users who continue to abuse the system after a temporary suspension will face a permanent lifetime ban from the platform.</li>
        </ul>
      </motion.div>
    </FooterPageLayout>
  );
}
