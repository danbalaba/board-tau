import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/user";
import { getTenantConversations } from "@/services/user/messages";
import MessagesClient from "@/components/messages/MessagesClient";
import { db } from "@/lib/db";

export const dynamic = 'force-dynamic';

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const MessagesPage = async ({ searchParams }: PageProps) => {
    const user = await getCurrentUser();
    const params = await searchParams;

    if (!user) {
        redirect("/");
    }

    // Role-based redirection if they are on the wrong hub
    if (user.role === "LANDLORD") {
        redirect("/landlord/messages");
    }

    if (user.role === "ADMIN") {
        redirect("/admin");
    }

    const listingId = params.listingId as string | undefined;
    const otherUserId = params.otherUserId as string | undefined;

    let conversations = await getTenantConversations();

    // Check if we need to inject a placeholder for a new conversation
    if (listingId && otherUserId) {
        const existing = conversations.find(c => c.listingId === listingId && c.landlordId === otherUserId);
        
        if (!existing) {
            // Fetch listing & landlord info for the placeholder
            const listing = await db.listing.findUnique({
                where: { id: listingId },
                include: { user: true }
            });

            if (listing && listing.userId === otherUserId) {
                const placeholder = {
                    id: `${listingId}_${otherUserId}`,
                    listingId: listingId,
                    listingTitle: listing.title,
                    listingImage: listing.imageSrc,
                    landlordId: otherUserId,
                    landlordName: listing.user.name || "Host",
                    landlordImage: listing.user.image || "",
                    lastMessage: "",
                    lastMessageTime: new Date().toISOString(),
                    unreadCount: 0,
                    isArchived: false,
                    isPlaceholder: true
                };
                // Prepend to conversations
                conversations = [placeholder, ...conversations];
            }
        }
    }

    return (
        <MessagesClient 
            initialConversations={conversations}
            currentUserId={user.id}
            currentUserImage={user.image}
            currentUserName={user.name}
        />
    );
};

export default MessagesPage;
