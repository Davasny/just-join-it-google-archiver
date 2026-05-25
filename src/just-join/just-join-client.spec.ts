import { describe, expect, it } from "vitest";
import { z } from "zod";
import { JustJoinClient } from "./just-join-client";
import { jjOfferSchema } from "./schemas";

const getValue = (obj: unknown, path: (string | number | symbol)[]) =>
  // biome-ignore lint/suspicious/noExplicitAny: dummy generic helper, it's fine to use any here
  path.reduce<any>((acc, key) => acc?.[key], obj);

describe("just join", () => {
  it("returns all offers in devops and validates schema", {
    timeout: 10_000,
  }, async () => {
    const jjClient = new JustJoinClient();
    const allOffers = await jjClient.getOffers({ category: "devops" });

    expect(allOffers.length).toBeGreaterThan(10);

    const parseResult = z.array(jjOfferSchema).safeParse(allOffers);

    if (!parseResult.success) {
      console.dir(
        parseResult.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
          received: getValue(allOffers, issue.path),
          offer: getValue(allOffers, issue.path.slice(0, 1)),
        })),
        { depth: null },
      );
    }
    expect(parseResult.success).toBeTruthy();
  });
});
