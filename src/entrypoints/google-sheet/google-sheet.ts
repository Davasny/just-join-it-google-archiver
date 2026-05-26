import "./google-sheet-polyfills";

import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { z } from "zod";
import {
  type FetchLike,
  JustJoinClient,
} from "../../just-join/just-join-client";
import {
  type jjCategory,
  jjCategorySchema,
  type jjOffer,
} from "../../just-join/schemas";

const appsScriptFetch: FetchLike = async (url, init) => {
  const response = UrlFetchApp.fetch(url, {
    method: init?.method as GoogleAppsScript.URL_Fetch.HttpMethod | undefined,
    payload: init?.body as GoogleAppsScript.URL_Fetch.Payload | undefined,
    headers: init?.headers as Record<string, string> | undefined,
    muteHttpExceptions: true,
  });

  return new Response(response.getContentText(), {
    status: response.getResponseCode(),
    headers: response.getAllHeaders() as HeadersInit,
  });
};

const formatDate = (dateString: string): string =>
  format(new Date(dateString), "dd.MM.yyyy HH:mm:ss", {
    locale: pl,
  });

export const runJustJoinArchive = async () => {
  const fileName = SpreadsheetApp.getActiveSpreadsheet().getName();
  const categories = [...fileName.matchAll(/\[(.*)\]/g)][0][1].split(",");

  if (categories.length === 0) {
    throw new Error(
      "No categories found in file name. Example valid filename: 'offers - [devops]' or '[devops,admin]'",
    );
  }

  const parsedCategories = z.array(jjCategorySchema).safeParse(categories);

  if (!parsedCategories.success) {
    throw new Error(
      `Invalid categories in file name: ${parsedCategories.error.message}`,
    );
  }

  const jjClient = new JustJoinClient(appsScriptFetch);

  const allOffers = new Map<jjCategory, jjOffer[]>();

  await Promise.all(
    parsedCategories.data.map(async (category) => {
      const offers = await jjClient.getOffers({ category: category });
      allOffers.set(category, offers);
    }),
  );

  console.log(
    `${Array.from(allOffers.values()).length} offers found in categories ${parsedCategories.data}`,
  );

  const offersSheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("offers");

  if (!offersSheet) {
    throw new Error("Sheet 'offers' not found");
  }

  const existingOffersIds = new Set<string>(
    offersSheet
      .getRange("A2:A")
      .getValues()
      .map((cells) => cells[0])
      .filter((id) => id !== null && id !== ""),
  );

  for (const [category, offers] of allOffers) {
    const newOffers = offers.filter(
      (offer) => !existingOffersIds.has(offer.guid),
    );

    console.log(`Found ${newOffers.length} new offers in category ${category}`);

    for (const offer of newOffers) {
      console.log(
        `Adding new offer ${offer.title} @ ${offer.companyName} [${category}]`,
      );

      const employment = {
        b2b: offer.employmentTypes.find(
          (e) => e.currency === "PLN" && e.type === "b2b",
        ),
        uop: offer.employmentTypes.find(
          (e) =>
            e.currency === "PLN" &&
            (e.type === "permament" || e.type === "permanent"),
        ),
      };

      const link = `https://justjoin.it/job-offer/${offer.slug}`;

      offersSheet.appendRow([
        offer.guid,
        link,
        offer.title,
        offer.companyName,
        offer.city,
        offer.workplaceType,
        offer.workingTime,
        offer.experienceLevel,
        formatDate(offer.publishedAt),
        formatDate(offer.expiredAt),

        // b2b
        employment.b2b?.from,
        employment.b2b?.to,

        employment.uop?.from,
        employment.uop?.to,

        formatDate(offer.lastPublishedAt),
        offer.isRemoteInterview,
        offer.isPromoted,
        offer.isSuperOffer,

        category,

        // date of showup on the api to track exact publication date
        formatDate(new Date().toISOString()),
      ]);
    }
  }
};
