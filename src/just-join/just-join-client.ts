import wretch from "wretch";
import QueryStringAddon from "wretch/addons/queryString";
import type { jjCategory, jjOffer } from "./schemas";

type JustJoinResponse = {
  data: jjOffer[];
  meta: {
    from: number;
    totalItems: number;
    prev: {
      cursor: null | number;
      itemsCount: number;
    };
    next: {
      cursor: number;
      itemsCount: number;
    };
  };
};

export type FetchLike = (url: string, init?: RequestInit) => Promise<Response>;

export class JustJoinClient {
  private fetchPolyfill: FetchLike;

  constructor(fetchPolyfill?: FetchLike) {
    this.fetchPolyfill = fetchPolyfill || fetch;
  }

  /**
   * returns all offers in provided category
   * */
  async getOffers({ category }: { category: jjCategory }): Promise<jjOffer[]> {
    const allOffers: jjOffer[] = [];

    let keepGoing = true;
    let cursor = 0;

    while (keepGoing) {
      console.log(`Fetching justjoin.it offers at cursor: ${cursor}`);

      const response = await wretch()
        .fetchPolyfill(this.fetchPolyfill)
        .addon(QueryStringAddon)
        .query({
          categories: category,
          itemsCount: 100,
          from: cursor,
        })
        .get("https://justjoin.it/api/candidate-api/offers")
        .json<JustJoinResponse>();

      cursor = response.meta.next.cursor;

      if (response.meta.next.itemsCount === 0) {
        keepGoing = false;
      }

      allOffers.push(...response.data);
    }

    return allOffers;
  }
}
