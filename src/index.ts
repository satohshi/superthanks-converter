import { processSpan } from './convert.js'
import { waitForElement } from './utils.js'

let pathBefore = window.location.href

const textChangeObserver = new MutationObserver((mutations) => {
	mutations.forEach((mutation) => {
		if (mutation.type === 'characterData') {
			const span = (mutation.target as CharacterData).parentElement!
			processSpan(span)
		}
	})
})

const newCommentObserver = new MutationObserver(() => {
	const spans = document.querySelectorAll<HTMLSpanElement>('span#comment-chip-price')
	spans.forEach((span) => {
		textChangeObserver.observe(span, { characterData: true, subtree: true })
		processSpan(span)
	})
})

const onPathChange = (url: string = window.location.href) => {
	pathBefore = url
	if (url.includes('comments')) {
		waitForElement('div#items', (element) => {
			const spans = element.querySelectorAll<HTMLSpanElement>('span#comment-chip-price')
			spans.forEach((span) => {
				textChangeObserver.observe(span, { characterData: true, subtree: true })
				processSpan(span)
			})

			// Observe for height changes to detect when new comments are loaded
			newCommentObserver.observe(element, { attributeFilter: ['style'] })
		})
	} else {
		newCommentObserver?.disconnect()
		textChangeObserver?.disconnect()
	}
}

onPathChange()

if ('onurlchange' in window) {
	// Supported in Tampermonkey
	window.addEventListener('urlchange', ({ url }) => onPathChange(url))
} else {
	// For other UserScript managers
	const softNavigationObserver = new MutationObserver(() => {
		if (pathBefore !== window.location.href) {
			onPathChange()
		}
	})

	const titleElement = document.querySelector('title')!
	softNavigationObserver.observe(titleElement, { childList: true })
}
