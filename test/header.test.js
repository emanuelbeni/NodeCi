const Page = require("./helpers/page");

let page;

beforeEach(async () => {
	page = await Page.build();
	await page.goto("localhost:3000");
}, 90000);

afterEach(async () => {
	await page.close();
});

// Test the header part of our web app - login/logout & etc.
test("Checking Header with correct text", async () => {
	const text = await page.$eval("a.left.brand-logo", (el) => {
		return el.innerHTML;
	});

	expect(text).toEqual("Blogster");
});

// Testing OAuth flow
test("Clicking login starts OAuth flow", async () => {
	await page.click(".right a");
	const url = await page.url();

	expect(url).toMatch("/accounts.google.com/");
});

// Testing OAuth logout
test("When signin, shows logout button", async () => {
	await page.login();

	const text = await page.getContentsOf('.right a[href="/auth/logout"]');
	expect(text).toEqual("Logout");
});
