import Pusher from "pusher-js";

const cleanEnv = (val: string | undefined) => (val || "").replace(/['"]/g, '');

const PusherConstructor: any = (Pusher as any)?.default || Pusher;

const dummyChannel = { bind: () => {}, unbind: () => {}, unbind_all: () => {} };
const dummyPusher = { subscribe: () => dummyChannel, unsubscribe: () => {}, bind: () => {}, unbind: () => {} };

export const pusherClient = typeof window !== 'undefined' && typeof PusherConstructor === 'function'
  ? new PusherConstructor(
      cleanEnv(process.env.NEXT_PUBLIC_PUSHER_APP_KEY),
      {
        cluster: cleanEnv(process.env.NEXT_PUBLIC_PUSHER_CLUSTER),
        channelAuthorization: {
          endpoint: '/api/pusher/auth',
          transport: 'ajax',
        },
      }
    )
  : (dummyPusher as any);
