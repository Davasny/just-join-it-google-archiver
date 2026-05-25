import "./google-sheet-polyfills";

import { format } from "date-fns";
import { pl } from "date-fns/locale";
import {
  type FetchLike,
  JustJoinClient,
} from "../../just-join/just-join-client";

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
  const jjClient = new JustJoinClient(appsScriptFetch);
  const offers = await jjClient.getOffers({ category: "devops" });

  console.log(`${offers.length} offers found`);

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

  const newOffers = offers.filter(
    (offer) => !existingOffersIds.has(offer.guid),
  );

  console.log(`Found ${newOffers.length} new offers`);

  for (const offer of newOffers) {
    console.log(`Adding new offer ${offer.title} @ ${offer.companyName}`);

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

      // date of showup on the api to track exact publication date
      formatDate(new Date().toISOString()),
    ]);
  }
};
