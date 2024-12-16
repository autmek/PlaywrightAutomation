const {test } = require('@playwright/test');
const{
    userName,passWord,adminURL,adminTitle,appName,
    smartCollectionPath,
} = require('../testUtils/constants');
const {
    login,
    NavigatetoApp,
} = require('../testUtils/commonFunctions');
let context, iframe, page;
test.beforeAll(async ({browser}) => {
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto(adminURL);
    await login(page,userName,passWord,adminTitle); 
    await page.waitForLoadState('load');
    iframe = page.frameLocator('[name=app-iframe]');
    await NavigatetoApp(page,appName);
});
test.afterAll(async()=>{
    await context.close();
})
test('Import Smart collections',async()=>{
    await page.locator('#FILE').click();
    const dropZone = await page.locator('.Drop-Zone');
    const fileInput = await page.locator('#fileDropZone');
await page.pause();

});