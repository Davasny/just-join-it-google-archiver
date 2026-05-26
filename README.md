# justjoin-it-google-sheet-archive

## Usage

1. Install deps

```bash
pnpm install
```

2. Login into google [clasp](https://developers.google.com/apps-script/guides/clasp)

```bash
clasp login
```

3. Create google sheet with name containing justjoin.it categories in square brackets, e.g.
   `justjoin.it [frontend,backend]`.

3.1 Get Apps Script ID:

Go to Extension -> Apps Script -> Settings -> Copy script ID

4. Initialize clasp project

```bash
clasp clone --rootDir google-drive-dist <script id> 
```

5. Build the script

```bash
pnpm build
```

6. Deploy to google sheet

```bash
clasp push
```

## Automation

Go to your newely created google sheet, click on Extension -> Apps Script -> Triggers -> Add Trigger. There you can add
cronjob.

## Testing

```bash
pnpm test
```
