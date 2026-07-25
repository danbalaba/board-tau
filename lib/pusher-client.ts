import Pusher from "pusher-js";

const cleanEnv = (val: string | undefined) => (val || "").replace(/['"]/g, '');

export const pusherClient = typeof window !== 'undefined' 
  ? new Pusher(
      cleanEnv(process.env.NEXT_PUBLIC_PUSHER_APP_KEY),
      {
        cluster: cleanEnv(process.env.NEXT_PUBLIC_PUSHER_CLUSTER),
        channelAuthorization: {
          endpoint: '/api/pusher/auth',
          transport: 'ajax',
        },
      }
    )
  : (null as any);
