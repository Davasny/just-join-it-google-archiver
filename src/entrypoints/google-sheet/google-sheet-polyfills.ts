class AppsScriptURLSearchParams {
  private params: [string, string][] = [];

  append(key: string, value: string) {
    this.params.push([key, value]);
  }

  toString() {
    return this.params
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
      )
      .join("&");
  }
}

if (typeof globalThis.URLSearchParams === "undefined") {
  globalThis.URLSearchParams =
    AppsScriptURLSearchParams as unknown as typeof URLSearchParams;
}

class AppsScriptFormData {}

if (typeof globalThis.FormData === "undefined") {
  globalThis.FormData = AppsScriptFormData as typeof FormData;
}

class AppsScriptResponse {
  status: number;
  statusText: string;
  headers: HeadersInit | undefined;
  private body: string;

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    this.body = String(body ?? "");
    this.status = init?.status ?? 200;
    this.statusText = init?.statusText ?? "";
    this.headers = init?.headers;
  }

  get ok() {
    return this.status >= 200 && this.status < 300;
  }

  async text() {
    return this.body;
  }

  async json() {
    return JSON.parse(this.body);
  }

  clone() {
    return new AppsScriptResponse(this.body, {
      status: this.status,
      statusText: this.statusText,
      headers: this.headers,
    });
  }
}

if (typeof globalThis.Response === "undefined") {
  globalThis.Response = AppsScriptResponse as unknown as typeof Response;
}
