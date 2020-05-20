const puppeteer = require("puppeteer");
const sessionFactory = require("../factories/sessionFactory");
const userFactory = require("../factories/userFactory");

class CustomPage {
	static async build() {
		const browser = await puppeteer.launch({
			headless: true,
			args: ["--no-sandbox"],
		});

		const page = await browser.newPage();
		const customPage = new CustomPage(page);

		return new Proxy(customPage, {
			get: function (target, property) {
				return target[property] || browser[property] || page[property];
			},
		});
	}

	constructor(page) {
		this.page = page;
	}

	async login() {
		const user = await userFactory();
		const { session, sig } = sessionFactory(user);

		await this.page.setCookie({ name: "session", value: session });
		await this.page.setCookie({ name: "session.sig", value: sig });
		await this.page.goto("localhost:3000/blogs");
		await this.page.waitFor('.right a[href="/auth/logout"]');
	}

	async getContentsOf(selector) {
		return await this.page.$eval(selector, (el) => el.innerHTML);
	}

	async fetch(type, url, data = {}) {
		if (type === "GET") {
			return await this.page.evaluate((_url) => {
				return fetch(_url, {
					method: "GET",
					credentials: "same-origin",
					headers: {
						"Content-Type": "application/json",
					},
				}).then((res) => res.json());
			}, url);
		} else {
			return await this.page.evaluate(
				(_url, _data) => {
					return fetch(_url, {
						method: "POST",
						credentials: "same-origin",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(_data),
					}).then((res) => res.json());
				},
				url,
				data
			);
		}
	}
}

module.exports = CustomPage;
