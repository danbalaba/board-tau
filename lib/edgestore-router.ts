import { initEdgeStore } from "@edgestore/server";
import { z } from "zod";

type Context = {
  userId: string;
  role: string;
};

const es = initEdgeStore.context<Context>().create();

export const edgeStoreRouter = es.router({
  publicFiles: es
    .fileBucket({
      maxSize: 1024 * 1024 * 10,
      accept: ["image/jpeg", "image/png", "image/webp"],
    })
    .metadata(({ ctx }) => ({
      userId: ctx.userId,
    }))
    .beforeUpload(({ ctx }) => ctx.userId !== "unauthenticated")
    .beforeDelete(({ ctx, fileInfo }) => {
      const metadata = fileInfo.metadata as Record<string, any>;
      return ctx.userId !== "unauthenticated" && (ctx.userId === metadata.userId || ctx.role === "ADMIN");
    }),

  reviewMedia: es
    .fileBucket({
      maxSize: 1024 * 1024 * 50,
      accept: ["image/*", "video/*"],
    })
    .beforeUpload(({ ctx }) => ctx.userId !== "unauthenticated"),

  identityDocs: es
    .fileBucket({
      maxSize: 1024 * 1024 * 10,
      accept: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
    })
    .input(
      z.object({
        listingId: z.string(),
        landlordId: z.string(),
      })
    )
    .path(({ ctx, input }) => [{ owner: ctx.userId }, { landlord: input.landlordId }])
    .metadata(({ ctx, input }) => ({
      userId: ctx.userId,
      listingId: input.listingId,
      landlordId: input.landlordId,
    }))
    .beforeUpload(({ ctx }) => {
      const allowedRoles = ["USER", "LANDLORD", "ADMIN"];
      return ctx.userId !== "unauthenticated" && allowedRoles.includes(ctx.role);
    })
    .accessControl({
      OR: [
        { role: { eq: "ADMIN" } },
        { userId: { path: "landlord" } },
        { userId: { path: "owner" } },
      ],
    }),
});

export type EdgeStoreRouter = typeof edgeStoreRouter;
