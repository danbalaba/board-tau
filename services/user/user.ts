import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const getCurrentUser = async () => {
  try {
    const session = await getServerSession(authOptions);
    console.log("getCurrentUser - session:", session);
    console.log("getCurrentUser - user:", session?.user);
    
    if (!session?.user) {
      console.log("getCurrentUser - No user in session");
      return null;
    }
    
    // Make sure the user has an id
    if (!session.user.id) {
      console.log("getCurrentUser - User has no id:", session.user);
      return null;
    }
    
    return session?.user;
  } catch (error) {
    console.error("getCurrentUser - Error:", error);
    return null;
  }
};
