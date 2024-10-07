import { CURRENCY_SYMBOL_MAP, API_KEY, CURRENCY, LOCALE } from './constants.js'

const exchangeRates = await (async () => {
	const response = await fetch(`https://v6.exchangerate-api.com/v6/${API_KEY}/latest/${CURRENCY}`)
	const json = await response.json()
	const rates = json.conversion_rates
	return new Map<string, number>(Object.entries(rates))
})()

const currencyFormatter = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY })

const parseAndConvert = (inputText: string): number | void => {
	const match = inputText.match(/(?<currency>^.*?)(?<amount>\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/)
	let { currency, amount } = match!.groups!

	if (!currency || !amount) {
		console.error(`Failed to match ${inputText}`)
		return
	}

	currency = currency.trim()
	amount = amount.replaceAll(',', '')

	// Already in the desired currency
	if (CURRENCY_SYMBOL_MAP[currency] === CURRENCY) return

	let currencyCode = CURRENCY_SYMBOL_MAP[currency]
	if (!currencyCode) {
		if (currency.length === 3) {
			// Should work for currencies CA$, HK$, etc.
			currencyCode = currency.replace('$', 'D')
		} else {
			console.error(`Failed to find currency code for ${currency}`)
			return
		}
	}

	const rate = exchangeRates.get(currencyCode)
	if (!rate) {
		console.error(`Failed to find exchange rate for ${currencyCode}`)
		return
	}

	return Number(amount) / rate
}

export const processSpan = (element: HTMLElement): void => {
	// Get all child nodes in the SuperThanks chip
	const textNodes = [...element.childNodes] as Text[]

	// Remove added text nodes if they already exist
	if (textNodes.length === 3) {
		textNodes[0]!.remove()
		textNodes[2]!.remove()
	}

	const amountNode = textNodes.length === 1 ? textNodes[0] : textNodes[1]
	const converted = parseAndConvert(amountNode!.textContent!)
	if (!converted) return

	// YouTube seemingly hold a reference to the original text node and replaces it with a different one as you scroll.
	// If we modify the original text node by doing "element.innerText = ..." or something similar, whatever framework YouTube uses can no longer find the text node to replace.
	// So we have to insert a new text node next to it instead.
	element.prepend(`${currencyFormatter.format(converted)} (`)
	element.append(`)`)
}
