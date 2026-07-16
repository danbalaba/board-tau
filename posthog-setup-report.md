<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into BoardTAU, a Next.js 16 boarding house management platform for Tarlac Agricultural University. The integration uses the Next.js 15.3+ pattern: PostHog is initialized once in `instrumentation-client.ts` alongside the existing Sentry setup, and a reverse proxy via `next.config.js` rewrites routes through `/ingest` to bypass ad blockers. Server-side tracking is handled by a new `lib/posthog-server.ts` singleton using `posthog-node`. User identity is established client-side in the session-aware `EdgeStoreWrapper` component (`components/common/Provider.tsx`) on every page load, and server-side in the NextAuth `signIn` callback. No existing code was removed — all PostHog instrumentation was added additively.

| Event name | Description | File |
|---|---|---|
| `inquiry_submitted` | User submits a room inquiry from the listing detail page | `components/listings/detail/ListingDetailsClient.tsx` |
| `inquiry_created` | Server confirms a new inquiry was successfully created | `app/api/inquiries/route.ts` |
| `inquiry_approved` | Landlord approves an inquiry, creating a reservation | `app/api/inquiries/[id]/approve/route.ts` |
| `checkout_session_created` | A Stripe checkout session was created for a pending payment | `app/api/payments/checkout/route.ts` |
| `payment_completed` | Stripe webhook confirms a checkout payment was completed | `app/api/webhooks/stripe/route.ts` |
| `review_submitted` | Tenant submits a review after a completed stay | `app/api/reviews/route.ts` |
| `host_application_submitted` | User submits an application to become a host/landlord | `app/api/host-applications/route.ts` |
| `reservation_cancelled` | Tenant cancels their pending or reserved booking | `app/api/reservations/[id]/cancel/route.ts` |
| `user_signed_in` | User successfully signs in via any auth provider | `lib/auth.ts` |
| `listing_created` | Landlord successfully creates a new property listing | `app/api/landlord/properties/route.ts` |

## Next steps

We've built a dashboard and five insights to monitor the key user journeys:

- [Analytics basics (wizard) — Dashboard](https://us.posthog.com/project/508520/dashboard/1835180)
- [Booking conversion funnel](https://us.posthog.com/project/508520/insights/M2Y04DYO) — inquiry → approval → checkout → payment
- [New inquiries over time](https://us.posthog.com/project/508520/insights/f7caPRxF)
- [Payments completed over time](https://us.posthog.com/project/508520/insights/8WPPpRHy)
- [Reservation cancellations vs new inquiries](https://us.posthog.com/project/508520/insights/YP4Un7DH)
- [Host applications and listings created](https://us.posthog.com/project/508520/insights/6moswTxR)

## LLM analytics

BoardTAU uses Google Gemini (`@google/generative-ai`) across three API routes and one server action. LLM analytics are instrumented using manual `$ai_generation` event capture via `posthog-node` (the OpenTelemetry auto-instrumentation path was not used because it requires the newer `@google/genai` SDK, not the `@google/generative-ai` SDK the project uses). A shared helper `lib/posthog-ai.ts` encapsulates the capture call and is reused across all four call sites.

`posthog-js` was listed in `package.json` but was not installed — it was added to `node_modules` as part of this session.

The `app/api/ai/suggest/route.ts` route uses `export const runtime = "edge"` (Edge Runtime), which is incompatible with `posthog-node`'s Node.js APIs, so it was intentionally skipped.

| Span name | Route / action | Model |
|---|---|---|
| `ai_chat` | `app/api/ai/chat/route.ts` | gemini-3-flash-preview |
| `ai_compare` | `app/api/ai/compare/route.ts` | gemini-3-flash-preview |
| `ai_recommend` | `app/api/ai/recommend/route.ts` | gemini-3-flash-preview |
| `ai_enrichment` | `app/actions/ai-enrichment.ts` | gemini-3-flash-preview |

Each `$ai_generation` event captures: `$ai_model`, `$ai_provider` (`google`), `$ai_input`, `$ai_output_choices`, `$ai_input_tokens`, `$ai_output_tokens`, `$ai_latency`, and `$ai_span_name`. When the request is authenticated, the user's ID is used as `distinctId`; otherwise an anonymous `anon:<ip>` string is used.

View live traces at [PostHog AI Observability → Generations](https://us.posthog.com/project/508520/ai-observability/generations).

## Verify before merging

- [ ] Run a full production build (`npm run build`) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` to `.env.example` and any CI/deployment bootstrap scripts so collaborators know what to set.
- [ ] Wire source-map upload (`posthog-cli sourcemap` or equivalent) into CI so production stack traces de-minify for PostHog error tracking.
- [ ] Confirm the returning-visitor path also calls `identify` — the current implementation identifies in `EdgeStoreWrapper` on every session load, which should cover returning users, but verify by signing in, refreshing, and checking the PostHog person page for a stable distinct ID.
- [ ] Trigger the four instrumented Gemini call paths (chat, compare, recommend, enrichment) and confirm `$ai_generation` events appear in [PostHog AI Observability](https://us.posthog.com/project/508520/ai-observability/generations).

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
