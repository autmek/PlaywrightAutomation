const { expect } = require('@playwright/test');

async function login(page,userName,passWord,adminTitle){
    await page.waitForLoadState('load');
    const loginCard = await page.locator('.login-card ').count();
    if(loginCard===0){
        await page.reload();
    }
    await page.waitForTimeout(1000);
    await page.locator('#account_email').fill(userName);
    await page.waitForSelector("[type='submit']", { state: 'visible' });
    await page.locator("[type='submit']").click();

    await page.waitForSelector('#account_password', { state: 'visible' });
    await page.locator('#account_password').fill(passWord);
    const filledPassword = await page.locator('#account_password').inputValue();
    if (filledPassword !== passWord) {
        throw new Error("Password was not correctly filled.");
    }

    await Promise.all([
        page.waitForNavigation({ waitUntil: 'load' }),
        page.locator("[type='submit']").click()
    ]);

    // Confirm login by checking title
    await expect(page).toHaveTitle(adminTitle);
    console.log('Successfully loggedIn to shopify Admin page');
}
async function NavigatetoApp(page,appName){
    await page.waitForLoadState('load');
    await page.getByRole("button", { name: 'Apps', exact: true  }).click();
    await page.getByRole('option', { name: appName }).click();
    await page.waitForLoadState('load');
}

module.exports = {
    login,
    NavigatetoApp,
}