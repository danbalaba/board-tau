import Pusher from "pusher";

const cleanEnv = (val: string | undefined) => (val || "").replace(/['"]/g, '');

export const pusherServer = new Pusher({
  appId: cleanEnv(process.env.PUSHER_APP_ID),
  key: cleanEnv(process.env.NEXT_PUBLIC_PUSHER_APP_KEY),
  secret: cleanEnv(process.env.PUSHER_SECRET),
  cluster: cleanEnv(process.env.NEXT_PUBLIC_PUSHER_CLUSTER),
  useTLS: true,
});
