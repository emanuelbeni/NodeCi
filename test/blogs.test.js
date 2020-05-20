const Page = require("./helpers/page");

let page;
beforeEach(async () => {
	page = await Page.build();
	await page.goto("http://localhost:3000");
});

afterEach(async () => {
	await page.close();
});

describe("When logged in", async () => {
	beforeEach(async () => {
		await page.login();
		await page.click("a.btn-floating");
	});

	// Test blog creation form
	test("Check if form for new blog appears on the screen", async () => {
		const label = await page.getContentsOf("form label");

		expect(label).toEqual("Blog Title");
	});

	// Nested describe when submitting valid input
	describe("And using valid input", async () => {
		beforeEach(async () => {
			await page.type("input[name=title]", "Title");
			await page.type("input[name=content]", "Content");

			await page.click("form button");
		});

		test("Valid input is submitted, directed to review screen", async () => {
			const formReviewHeader = await page.getContentsOf("form h5");
			expect(formReviewHeader).toEqual("Please confirm your entries");
		});

		test("Submit valid input form", async () => {
			await page.click("button.green");
			await page.waitFor(".card");
			const newTitle = await page.getContentsOf(".card-title");
			const newContent = await page.getContentsOf(".card-content p");

			expect(newTitle).toEqual("Title");
			expect(newContent).toEqual("Content");
		});
	});

	// Nested describe when submitting invalid input
	describe("And using invalid input", async () => {
		beforeEach(async () => {
			await page.click("form button");
		});

		test("form shows error message", async () => {
			const error1 = await page.getContentsOf(".title .red-text");
			const error2 = await page.getContentsOf(".content .red-text");
			expect(error1).toEqual("You must provide a value");
			expect(error2).toEqual("You must provide a value");
		});
	});
});

// Testing API endpoint when user not logged in
describe("User is not logged in", async () => {
	test("User cannot create blog post", async () => {
		const result = await page.fetch("POST", "api/blogs", {
			title: "hello",
			content: "hello",
		});
		expect(result).toEqual({ error: "You must log in!" });
	});

	test("User cannot get blogs posts", async () => {
		const result = await page.fetch("GET", "/api/blogs");
		expect(result).toEqual({ error: "You must log in!" });
	});
});
