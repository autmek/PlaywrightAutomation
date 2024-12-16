const { expect } = require('@playwright/test');

async function login(page,userName,passWord,adminTitle){
    await page.waitForLoadState('load');    
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
    console.log('--> Successfully LoggedIn to shopify Admin page');
}

async function CreateNewWidget(page,iframe,appName, pageName, widgetType){
    await NavigatetoApp(page,appName);
    await iframe.getByRole('button', { name: 'Create new recommendation' }).click();
    await iframe.getByText(pageName).click();
    await iframe.locator('.sf-widget-card', {hasText: widgetType}).click({force:true});
    await iframe.locator('.sf-widget-button').click();

    // Click on the OK button in 'Widget created' modal
    const modal = await iframe.locator('.Polaris-Modal-Dialog');
    await expect(modal).toBeVisible();
    await iframe.getByRole('button', { name: 'Okay' }).click();
    console.log(`✅ ${pageName} - ${widgetType} is created`);
}

async function NavigatetoApp(page,appName){
    await page.waitForLoadState('load');
    await page.getByRole("button", { name: 'Apps', exact: true  }).click();
    await page.getByRole('option', { name: appName }).click();
    await page.waitForLoadState('load');
}

async function FindWidgetID(iframe){
    await iframe.locator('.Polaris-DataTable__Table tbody tr').last().waitFor();
    const lastRow = await iframe.locator('.Polaris-DataTable__Table tbody tr').last();
    const widgetID = await lastRow.locator('td:nth-of-type(2)').innerText();
    return widgetID;
}

async function editWidget(iframe,page,widgetID){
    await page.waitForTimeout(3000);
    await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
    });
    await iframe.locator('.Polaris-DataTable__Table tbody tr').last().waitFor();
    const editIcon = '.sf-edit-div .Polaris-Button .Polaris-Icon__Svg';
    const widgRow = await iframe.locator(`.Polaris-DataTable__Table tbody tr:has(td:has-text("${widgetID}"))`);
    await widgRow.locator(editIcon).click({delay: 100});
    //const targetCell = await widgRow.locator('td:nth-child(4)');
    //await targetCell.locator('div:nth-child(3)').click({ delay: 100 }); //click on edit icon
}

async function NavigateToStore(page){
    await page.getByRole('link', { name: 'Online Store' , exact: true}).hover();
    await page.waitForSelector('.Polaris-Navigation__SecondaryAction', { state: 'visible' });
    const storeURL = page.getByLabel('View your online store');
    const [newPage] = await Promise.all([
        page.context().waitForEvent('page'),
        storeURL.click(),
    ]);
    await newPage.waitForLoadState('load');
    return newPage;
}

async function NavigateToPage(newPage,pageName,storeURL,productName,CollectionPage){
    switch (pageName){
        case 'Product page':
            await newPage.locator('summary.header__icon--search').scrollIntoViewIfNeeded();
            await newPage.waitForTimeout(1000);
            await newPage.locator('summary.header__icon--search').click();
            await newPage.waitForTimeout(500);
            await newPage.locator('.search__input').fill(productName);
            await newPage.waitForTimeout(500);
            const productResult = await newPage.locator('.predictive-search__result-group');
            await productResult.getByRole('link', { name: productName}).click();
            await newPage.waitForTimeout(500);
        break;

        case 'Shop page':
            await newPage.goto(storeURL);
            await newPage.waitForTimeout(500);
        break;

        case '404 page':
            await newPage.goto(`${storeURL}404`);
            await newPage.waitForTimeout(500);
        break;

        case 'Collection page':
            await newPage.goto(`${storeURL}collections`);
            await newPage.waitForTimeout(500);
            await newPage.getByRole('link', { name: CollectionPage }).click();
            await newPage.waitForTimeout(500);
        break;

        case 'Cart page':
            await newPage.goto(`${storeURL}cart`);
            await newPage.waitForTimeout(500);
        break;
    }
}

async function WidgetIsDisplayed(newPage,widgetID){
    const widgetlocator = `.storefrog-widget[data-widget-id="${widgetID}"]`;
    await newPage.waitForTimeout(3000);
    await newPage.waitForSelector(widgetlocator);
    const newWidg = await newPage.locator(widgetlocator);
    await expect(newWidg).toBeVisible();
    return newWidg;
}

async function WidgetNotDisplayed(newPage,widgetID){
    await newPage.waitForLoadState('networkidle');
    await newPage.waitForTimeout(2000);
    const newWidg = await newPage.locator(`.storefrog-widget[data-widget-id="${widgetID}"]`);
    await expect(newWidg).toBeHidden();
}

async function Savewidget(iframe, page){
    await iframe.locator('.sf-widget-button').click();
    const successMessage = await iframe.locator('text="Widget saved"');
    await successMessage.waitFor({ state: 'visible', timeout: 5000 });
    await expect(successMessage).toBeVisible();
    await page.waitForLoadState('load');
    await iframe.locator('.sf-widget-button').click();
    await page.waitForLoadState('load');
}

async function ReloadandWait_Newpage(newPage){
    await newPage.reload();
    await newPage.waitForTimeout(2000);
    await newPage.reload();
    await newPage.waitForTimeout(3000);
}

async function RemovePreviousDisplayFilter(iframe){
    const previous_option = await iframe.locator('.sf-filter-button-container .Polaris-Icon__Svg');
    const opt_count = await previous_option.count();
    if (opt_count > 1){
        await previous_option.first().click();
    }
}

async function ApplyDisplayFilter(iframe, type, action, value){

    await iframe.getByText('Add filter').click(); //Add filter
    await iframe.locator(`.sf-filter-elements:has-text("${type}")`).click(); //filter type

    await iframe.getByText(action).click(); //Include/ Exclude
    await iframe.locator(`.sf-settings-btn`).nth(1).scrollIntoViewIfNeeded(); //Just to see the area properly
    await iframe.locator(`input[role="combobox"]`).click({force:true});
    await iframe.locator(`input[role="combobox"]`).fill(value);
    await iframe.getByRole('option', { name: value, exact: true }).click();
}

async function ViewDate(iframe, ActiveWindow){
	await iframe.getByText('Add filter').click();
	await iframe.getByText(`Viewing date`).click(); 
	if (!ActiveWindow){
	    const today = new Date();
	    const tomorrow = new Date(today);
	    tomorrow.setDate(today.getDate() + 1);
	    const tomorrow_monthName = tomorrow.toLocaleDateString('en-US', { month: 'long' });
        const today_monthName = today.toLocaleDateString('en-US', { month: 'long' });
        const day = tomorrow.getDate();
        await iframe.locator(`.sf-settings-btn`).nth(1).scrollIntoViewIfNeeded(); //Just to see the area properly
        await iframe.locator('.sf-datepicker-mT .Polaris-Box').first().click({force:true});
        if(tomorrow_monthName!==today_monthName){
            await iframe.locator('.Polaris-DatePicker__Header .Polaris-Button__Icon').nth(1).click();
        }
        await iframe.locator('.Polaris-DatePicker__Day').nth(day-1).click();  
    }
}

async function UserRole(iframe, userRole)
{
    await iframe.getByText('Add filter').click();
    await iframe.getByText(`User role`).click();
    await iframe.getByText(userRole).click();
}

async function Price(iframe, optionValue,price){

    await iframe.getByText('Add filter').click(); 
    await iframe.getByText(`Price`).click();
    await iframe.locator('select.Polaris-Select__Input').selectOption(optionValue);   
    await iframe.locator('input[type="number"]').fill(price);
}

async function RecentViewedProducts(recentViewed_products,newPage,storeURL,pageURL){
    for(const recents of recentViewed_products){
        console.log(`Visiting ${recents}...`);
        await NavigateToPage(newPage,'Product page',storeURL,recents);
        await newPage.waitForLoadState('networkidle');
        await newPage.waitForTimeout(3000);
        await newPage.goto(pageURL);
        await newPage.waitForTimeout(1000);
    }
}

async function addToCart(newPage){
    await newPage.waitForTimeout(3000);
    await newPage.locator('.product-form__submit').click();
    await newPage.waitForSelector('#cart-notification');
    await newPage.locator('.cart-notification__close').click();
    await newPage.waitForTimeout(1000);
}

async function deleteFromCart(newPage){
    const cartItem = await newPage.locator('#CartItem-1 #Remove-1');
    let cartItem_Count = await cartItem.count();
    if(cartItem_Count>0){
        while(cartItem_Count>0){
            await cartItem.click();
            await newPage.waitForTimeout(1000); 
            cartItem_Count = await cartItem.count();
        }    
    }
}

async function editverify_Title(iframe,page,newPage,widgetID,newtitle){
    const titlebox = await iframe.locator('.Polaris-TextField__Input');
    await titlebox.fill(newtitle);
    await Savewidget(iframe,page);
    await ReloadandWait_Newpage(newPage)
    const newWidg = await WidgetIsDisplayed(newPage,widgetID);
    const widg_title = await newWidg.locator('.sf-widget-title').textContent();
    expect(widg_title).toBe(newtitle); 
}
async function Verify_variableToCart(newPage,widgetID,storeURL){
    const newWidg = await WidgetIsDisplayed(newPage,widgetID);
    await newPage.waitForTimeout(2000);
    const productContainers = await newWidg.locator('.sf-product-item');
    let productIndex = -1;
    for (let i = 0; i < await productContainers.count(); i++) {
        const chooseOptionButton = productContainers.nth(i).locator('.sf-select-btn:not([style*="display: none"])');
        if (await chooseOptionButton.isVisible()) {
            productIndex = i; 
            await chooseOptionButton.click(); 
            break; 
        }
    }
    if (productIndex === -1) {
        console.log('❗ No variable products in the recommendation.');
        return;
      }
    const targetProductContainer = productContainers.nth(productIndex);
    await newPage.waitForTimeout(2000);
    const dropdown = await targetProductContainer.locator('.sf-product-variants-dropdown');
    await dropdown.click();
    await dropdown.selectOption({ index: 1 });
    const variableProduct = await targetProductContainer.locator('.sf-product-title').textContent();
    const selectedOption = await dropdown.locator('option:nth-child(2)').textContent();
    const addToCartButton = await targetProductContainer.locator('.sf-add-to-cart-btn[style*="display: block"]');
    await addToCartButton.click();
    await newPage.waitForTimeout(2000);
    await NavigateToPage(newPage,'Cart page',storeURL);
    const cartItem = await newPage.locator(`.cart-item__details:has-text("${variableProduct}")`);
    const cartOption = await cartItem.locator('dl .product-option dd').innerText();
    expect(cartOption).toContain(selectedOption);
    await deleteFromCart(newPage);
    await newPage.goBack();
}
async function recomProductsOnWidget(newPage,widgetID,recommendation){
    const newWidg = await WidgetIsDisplayed(newPage,widgetID);
    const productTitles = await newWidg.locator('.sf-product-title').allTextContents();
    for(const recom of recommendation){
        expect(productTitles).toContain(recom);
    }
}

module.exports = { 
    addToCart,
    deleteFromCart,
    login,
    CreateNewWidget,
    NavigatetoApp,
    FindWidgetID,
    editWidget,
    NavigateToStore,
    WidgetIsDisplayed,
    WidgetNotDisplayed,
    Savewidget,
    ReloadandWait_Newpage,
    RemovePreviousDisplayFilter,
    ApplyDisplayFilter,
    ViewDate,
    UserRole, 
    Price,
    RecentViewedProducts,
    NavigateToPage,
    editverify_Title,
    Verify_variableToCart,
    recomProductsOnWidget,
 };