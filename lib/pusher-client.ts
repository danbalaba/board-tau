import Pusher from "pusher-js";

export const pusherClient = typeof window !== 'undefined' 
  ? new Pusher(
      process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        channelAuthorization: {
          endpoint: '/api/pusher/auth',
          transport: 'ajax',
        },
      }
    )
  : (null as any);
