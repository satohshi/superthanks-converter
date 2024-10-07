export const waitForElement = (
	selector: string,
	callback: (arg1: HTMLElement, ...args: any) => void,
	delay = 100,
	maxTries = 50
): void => {
	let tries = 0
	const timer = setInterval(() => {
		const element = document.querySelector<HTMLElement>(selector)
		if (element) {
			clearInterval(timer)
			callback(element)
		} else if (++tries > maxTries) {
			clearInterval(timer)
		}
	}, delay)
}
