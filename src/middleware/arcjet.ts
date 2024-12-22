import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/node";
import { NextFunction, Request, Response } from 'express';
import { httpResponse } from "../lib/httpResponse.ts";

const aj = arcjet({
  // Get your site key from https://app.arcjet.com and set it as an environment
  // variable rather than hard coding.
  key: process.env.ARCJET_KEY as string,
  characteristics: ["ip.src"], // Track requests by IP
  rules: [
    // Shield protects your app from common attacks e.g. SQL injection
    shield({ mode: "LIVE" }),
    // Create a bot detection rule
    detectBot({
      mode: "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      // Block all bots except the following
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
        // Uncomment to allow these other common bot categories
        // See the full list at https://arcjet.com/bot-list
        //"CATEGORY:MONITOR", // Uptime monitoring services
        //"CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
      ],
    }),
    // Create a token bucket rate limit. Other algorithms are supported.
    tokenBucket({
      mode: "LIVE",
      refillRate: 5, // Refill 5 tokens per interval
      interval: 10, // Refill every 10 seconds
      capacity: 10, // Bucket capacity of 10 tokens
    }),
  ],
});

export async function ajMiddleware(req: Request, res: Response, next: NextFunction) {
  const decision = await aj.protect(req, { requested: 5 }); // Deduct 5 tokens from the bucket
  console.log("Arcjet decision", decision);

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      return httpResponse(429, "Rate limit exceeded", {}, res);
    } else if (decision.reason.isBot()) {
      return httpResponse(403, "Forbidden", {}, res);
    } else {
      return httpResponse(403, "Forbidden", {}, res);
    }
  } else {

    // One step further

    // Check if the Request is from a vpn or proxy

    if (decision.ip.isProxy() || decision.ip.isVpn()) {
      return httpResponse(403, "Forbidden", {}, res);
    }

    console.log("next");
    return next();
  }
}