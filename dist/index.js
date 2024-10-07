// ==UserScript==
// @name         SuperThanks Converter
// @version      1.0.0
// @description  Display SuperThanks in your preferred currency
// @author       Satohshi
// @source       https://github.com/satohshi/superthanks-converter
// @license      MIT
// @match        https://studio.youtube.com/*
// @grant        window.onurlchange
// ==/UserScript==

;(async () => {

// src/constants.ts
var API_KEY = "YOUR_API_KEY";
var CURRENCY = "YOUR_CURRENCY";
var LOCALE = "YOUR_LOCALE";
var CURRENCY_SYMBOL_MAP = {
  "\uFFE5": "JPY",
  "\u20AC": "EUR",
  "\xA3": "GBP",
  $: "USD",
  NT$: "TWD",
  R$: "BRL",
  A$: "AUD",
  MX$: "MXN"
};

// src/convert.ts
var exchangeRates = await (async () => {
  const response = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${CURRENCY}`);
  const json = await response.json();
  const rates = json.conversion_rates;
  return new Map(Object.entries(rates));
})();
var currencyFormatter = new Intl.NumberFormat(LOCALE, { style: "currency", currency: CURRENCY });
var parseAndConvert = (inputText) => {
  const match = inputText.match(/(?<currency>^.*?)(?<amount>\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
  let { currency, amount } = match.groups;
  if (!currency || !amount) {
    console.error(`Failed to match ${inputText}`);
    return;
  }
  currency = currency.trim();
  amount = amount.replaceAll(",", "");
  if (CURRENCY_SYMBOL_MAP[currency] === CURRENCY) return;
  let currencyCode = CURRENCY_SYMBOL_MAP[currency];
  if (!currencyCode) {
    if (currency.length === 3) {
      currencyCode = currency.replace("$", "D");
    } else {
      console.error(`Failed to find currency code for ${currency}`);
      return;
    }
  }
  const rate = exchangeRates.get(currencyCode);
  if (!rate) {
    console.error(`Failed to find exchange rate for ${currencyCode}`);
    return;
  }
  return Number(amount) / rate;
};
var processSpan = (element) => {
  const textNodes = [...element.childNodes];
  if (textNodes.length === 3) {
    textNodes[0].remove();
    textNodes[2].remove();
  }
  const amountNode = textNodes.length === 1 ? textNodes[0] : textNodes[1];
  const converted = parseAndConvert(amountNode.textContent);
  if (!converted) return;
  element.prepend(`${currencyFormatter.format(converted)} (`);
  element.append(`)`);
};

// src/utils.ts
var waitForElement = (selector, callback, delay = 100, maxTries = 50) => {
  let tries = 0;
  const timer = setInterval(() => {
    const element = document.querySelector(selector);
    if (element) {
      clearInterval(timer);
      callback(element);
    } else if (++tries > maxTries) {
      clearInterval(timer);
    }
  }, delay);
};

// src/index.ts
var pathBefore = window.location.href;
var textChangeObserver = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === "characterData") {
      const span = mutation.target.parentElement;
      processSpan(span);
    }
  });
});
var newCommentObserver = new MutationObserver(() => {
  const spans = document.querySelectorAll("span#comment-chip-price");
  spans.forEach((span) => {
    textChangeObserver.observe(span, { characterData: true, subtree: true });
    processSpan(span);
  });
});
var onPathChange = (url = window.location.href) => {
  pathBefore = url;
  if (url.includes("comments")) {
    waitForElement("div#items", (element) => {
      const spans = element.querySelectorAll("span#comment-chip-price");
      spans.forEach((span) => {
        textChangeObserver.observe(span, { characterData: true, subtree: true });
        processSpan(span);
      });
      newCommentObserver.observe(element, { attributeFilter: ["style"] });
    });
  } else {
    newCommentObserver?.disconnect();
    textChangeObserver?.disconnect();
  }
};
onPathChange();
if ("onurlchange" in window) {
  window.addEventListener("urlchange", ({ url }) => onPathChange(url));
} else {
  const softNavigationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "attributes" && mutation.target.classList.contains("loaded") && pathBefore !== window.location.href) {
        onPathChange();
      }
    });
  });
  waitForElement("ytcp-entity-page#entity-page.loaded", (main) => {
    softNavigationObserver.observe(main, { attributeFilter: ["class"] });
  });
}

})();
