# SuperThanks Converter

User script for YouTube Studio that converts SuperThanks amount to your preferred currency.

This script uses [fawazahmed0's API](https://github.com/fawazahmed0/exchange-api) to get the exchange rate.  

## Installation

Copy-and-past the content of `dist/index.js` onto your userscript manager.  
Don't forget to change the following lines at the top:

```js
var LOCALE = 'YOUR_LOCALE' // BCP 47 language tag (e.g. ja-JP)
var CURRENCY = 'YOUR_CURRENCY' // ISO 4217 currency code (e.g. JPY)
```

> [!NOTE]
> I highly recommend using [Tampermonkey](https://www.tampermonkey.net/) to run the script, as it supports `window.onurlchange` for SPAs like YouTube Studio.  
> Although I have added a fallback method for other userscript managers, it's not as efficient or reliable.

## Development

Create `.env` file in the root directory with the following content:

| Variable   | Description                         |
| ---------- | ----------------------------------- |
| `LOCALE`   | BCP 47 language tag (e.g. `ja-JP`)  |
| `CURRENCY` | ISO 4217 currency code (e.g. `JPY`) |

Then run:

```bash
pnpm run dev
```

It will start esbuild in watch mode and automatically update `dev/index.js` whenever you make changes.
