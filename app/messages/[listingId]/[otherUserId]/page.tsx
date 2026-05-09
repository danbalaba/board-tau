import { redirect } from "next/navigation";

type PageProps = {
    params: Promise<{ listingId: string; otherUserId: string }>;
};

export default async function MessageRoutePage({ params }: PageProps) {
    const { listingId, otherUserId } = await params;
    
    // Redirect to the new Messaging Hub with search parameters
    redirect(`/messages?listingId=${listingId}&otherUserId=${otherUserId}`);
}
