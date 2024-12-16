const {expect } = require('@playwright/test');
const { 
    higherPricedVariant,
    recom_Products,
    productCoupon,
    shippingCoupon,
    orderCoupon,
} = require('./constants');
const { addToCart,
    Savewidget,
    ReloadandWait_Newpage,
    WidgetIsDisplayed,
    NavigateToPage,
    deleteFromCart,
 } = require('./CommonFunctions');
const { Customise_SaveChanges } = require('./visualPreference');
async function editverify_Title(iframe,page,newPage,widgetID,newtitle){
    const titlebox = await iframe.locator('.Polaris-TextField__Input').first();
    await titlebox.fill(newtitle);
    await Savewidget(iframe,page);
    await ReloadandWait_Newpage(newPage);
    await addToCart(newPage);
    const newWidg = await WidgetIsDisplayed(newPage,widgetID);
    const widg_title = await newWidg.locator('.sf-widget-title').textContent();
    expect(widg_title).toBe(newtitle); 

}

async function moreQuantity(iframe,page,triggerOption,triggerValue){
    await iframe.getByText(triggerOption).first().click();
    await page.waitForTimeout(3000);
    await iframe.getByRole('button',{name:/Manage/}).click({force:true});
    await page.waitForTimeout(1000);
    const upsellModal = await iframe.locator('.Polaris-Modal-Section');
    let modalcount;
    modalcount = await upsellModal.count();
    if(modalcount===0){
        while(modalcount === 0){
            await iframe.getByRole('button',{name:/Manage/}).click({force:true});
            await page.waitForTimeout(1000); 
            modalcount = await upsellModal.count();     
        } 
    }
    await upsellModal.locator('.Polaris-TextField__Input').fill(triggerValue);
    await page.waitForTimeout(500);
    await upsellModal.getByLabel(triggerValue).locator('.Polaris-Checkbox').check();
    await page.waitForTimeout(1000);
    await iframe.locator('.sf-cs-modal-footer').getByRole('button',{name:'Confirm'}).click();
}

async function sameProductasUpsell(newPage,widgetID,triggerProduct){
    const newWidg = await WidgetIsDisplayed(newPage, widgetID);
    const Upsell = await newWidg.locator('.sf-product-title').textContent();
    expect(Upsell).toBe(triggerProduct);
}

async function higherPriced(iframe,page,triggerOption,triggerValue){
    await iframe.getByText(triggerOption).nth(1).click();
    if(triggerOption!== 'All products'){
        await iframe.getByRole('button',{name:/Manage/}).click({force:true});
        await page.waitForTimeout(1000);
        const upsellModal = await iframe.locator('.Polaris-Modal-Section');
        let modalcount;
        modalcount = await upsellModal.count();
        if(modalcount===0){
            while(modalcount === 0){
                await iframe.getByRole('button',{name:/Manage/}).click({force:true});
                await page.waitForTimeout(1000); 
                modalcount = await upsellModal.count();     
            } 
        }
        await upsellModal.locator('.Polaris-TextField__Input').fill(triggerValue);
        await page.waitForTimeout(500);
        await upsellModal.getByLabel(triggerValue).locator('.Polaris-Checkbox__Input').check();
        await page.waitForTimeout(1000);
        await iframe.locator('.sf-cs-modal-footer').getByRole('button',{name:'Confirm'}).click();
    }
}

async function highestVariantasUpsell(newPage,widgetID){
   const newWidg = await WidgetIsDisplayed(newPage, widgetID);
   const variantOn_widget = await newWidg.locator('.sf-product-variants-dropdown').textContent();
   expect(variantOn_widget).toBe(higherPricedVariant);
}

async function customAll(iframe,page){
    await iframe.getByRole('button',{name:"Next"}).click();
    for(const Recommendation of recom_Products){
        await iframe.locator('.Polaris-TextField__Input').fill(Recommendation);
        await page.waitForTimeout(1000);
        await iframe.locator('.Polaris-Checkbox').click();
        await page.waitForTimeout(1000);
    }
    await iframe.getByRole('button',{name:"Confirm"}).click();
    await iframe.getByRole('button',{name: 'Continue'}).click();
}
async function editverify_subtitle(page,newPage,iframe,Subtitle,widgetID){
    const subtitleBox = await iframe.locator('input.Polaris-TextField__Input').nth(1);
    await subtitleBox.fill(Subtitle);
    await Savewidget(iframe,page);
    await ReloadandWait_Newpage(newPage);
    await addToCart(newPage);
    const newWidg = await WidgetIsDisplayed(newPage, widgetID);
    const discount_onStore = await newWidg.locator('.sf-discount-text').textContent();
    expect(discount_onStore).toBe(Subtitle);
}
async function Discount(iframe,page,en_dis,discount){
    await iframe.locator('.widget-settings-button').scrollIntoViewIfNeeded();
    const discountCheckbox = await iframe.locator('.Polaris-Checkbox__Input').nth(3);
    const isDiscountChecked = await discountCheckbox.isChecked();
    if (en_dis === 'enable' ){
        if (!isDiscountChecked) {
            await discountCheckbox.click({ force: true });
        }    
        await iframe.locator('.Polaris-TextField__Input').nth(2).fill(discount);
        await page.waitForTimeout(1000);
    }else if((en_dis === 'disable' && isDiscountChecked)) 
    {
        await discountCheckbox.click({force:true});
    }
}
async function discountApplied(newWidg,newPage,storeURL,en_dis,discountValue){
    const discount_onStore = await newWidg.locator('.sf-discount-text');
    if(en_dis==='disable'){
        await expect(discount_onStore).toBeHidden();
    }else{
        await expect(discount_onStore).toBeVisible();
        const checkbox = await newWidg.locator('.sf-product-checkbox').first();
        if(await checkbox.isVisible()){
            await checkbox.click();
        }
        const addedProduct = await newWidg.locator('.sf-product-item').first();
        const productName = await addedProduct.locator('.sf-product-title').innerText();
        await newWidg.locator('.sf-fbt-add-to-cart-btn').click();
        await newPage.waitForTimeout(3000);
        const urlnow = await newPage.url();
        if(! urlnow.includes('cart')){
            await NavigateToPage(newPage,'Cart page',storeURL);
        }
        const cartItems = await newPage.locator('.cart-items .cart-item .cart-item__details');
        const productInCart = cartItems.filter({
            has: newPage.locator('.cart-item__name', { hasText: productName })
        });
        const cartItemOldPrice = await productInCart.locator('.cart-item__discounted-prices .cart-item__old-price').innerText();
        const originalPrice = parseFloat(cartItemOldPrice.replace(/[^\d.]/g, ''));
        const discountedPrice = await productInCart.locator('.cart-item__discounted-prices .cart-item__final-price').innerText();
        const finalPrice = parseFloat(discountedPrice.replace(/[^\d.]/g, ''));
        const DiscountAmount = ((originalPrice - finalPrice)/originalPrice)*100;
        expect(DiscountAmount.toString()).toEqual(discountValue);
        await deleteFromCart(newPage);
        await newPage.goBack();    
    }
}
async function discountComboCheck(newPage,newWidg,storeURL,pageName,coupon,couponType,postCode){
    await addToCart(newPage);
    if(pageName==='Cart page'){
        await newWidg.locator('.sf-fbt-add-to-cart-btn').first().click();
        await newPage.waitForTimeout(3000);
    }else if(pageName==='Product page'){
        const checkbox = await newWidg.locator('.sf-product-checkbox').first();
        if(await checkbox.isVisible()){
            await checkbox.click();
        }
        await newWidg.locator('.sf-fbt-add-to-cart-btn').click();
        await newPage.waitForTimeout(3000);
    }
    await NavigateToPage(newPage,'Cart page',storeURL);
    await newPage.locator('#checkout').click();
    await newPage.waitForTimeout(1000);
    if(couponType==='shipping'){
        await newPage.getByPlaceholder('Postcode').fill(postCode);
    }
    const giftcardField = await newPage.locator('#gift-card-field');
    const sellCoupon = await giftcardField.locator('#tag-0');
    await expect(sellCoupon).toBeVisible();
    await giftcardField.getByPlaceholder('Discount code').fill(coupon);
    await newPage.waitForTimeout(3000);
    await giftcardField.getByRole('button',{name: 'Apply'}).click();
    await newPage.waitForSelector('#tag-1');
    const newCoupon = await giftcardField.locator('#tag-1');
    await expect(newCoupon).toBeVisible();
}

async function NOdiscountcombo(newPage,newWidg,pageName,storeURL){
    if(pageName==='Cart page'){
        await newWidg.locator('.sf-fbt-add-to-cart-btn').first().click();
        await newPage.waitForTimeout(3000);
    }else if(pageName==='Product page'){
        await addToCart(newPage);
        const checkbox = await newWidg.locator('.sf-product-checkbox').first();
        if(await checkbox.isVisible()){
            await checkbox.click();
        }
        await newWidg.locator('.sf-fbt-add-to-cart-btn').first().click();
        await newPage.waitForTimeout(3000);
    }
    await NavigateToPage(newPage,'Cart page',storeURL);
    await newPage.locator('#checkout').click();
    await newPage.waitForTimeout(1000);
    const giftcardField = await newPage.locator('#gift-card-field');
    const sellCoupon = await giftcardField.locator('#tag-0');
    await expect(sellCoupon).toBeVisible();

    await giftcardField.getByPlaceholder('Discount code').fill(productCoupon);
    await newPage.waitForTimeout(3000);
    await giftcardField.getByRole('button',{name: 'Apply'}).click();
    await newPage.waitForTimeout(3000);
    const noCombo = await giftcardField.locator('div[role="status"]');
    await expect(noCombo).toBeVisible();

    await giftcardField.getByPlaceholder('Discount code').fill(shippingCoupon);
    await newPage.waitForTimeout(3000);
    await giftcardField.getByRole('button',{name: 'Apply'}).click();
    await newPage.waitForTimeout(3000);
    await expect(noCombo).toBeVisible();

    await giftcardField.locator('button[aria-label="Close"]').click();
    await giftcardField.getByPlaceholder('Discount code').fill(orderCoupon);
    await newPage.waitForTimeout(3000);
    await giftcardField.getByRole('button',{name: 'Apply'}).click();
    await newPage.waitForTimeout(3000);
    await expect(sellCoupon).toBeVisible();
    const newCoupon = await giftcardField.locator('#tag-1');
    await expect(newCoupon).toBeHidden();
}
async function desktop_displayStyle(iframe,page,newPage,widgetID,displayStyle,recommendationType){
    const display_style = await iframe.locator('select.Polaris-Select__Input').first();
    const recommendationOptions = {
        quantity: {
            grid: 'us-quantity-grid',
            popup: 'us-quantity-popup',
            list: 'us-quantity-list'
        },
        variant: {
            grid: 'us-variant-grid',
            popup: 'us-variant-popup',
            list: 'us-variant-list'
        },
        custom: {
            grid: 'us-custom-grid',
            popup: 'us-popup-desktop',
            list: 'us-custom-list'
        }
    };
    const displayStyleLower = displayStyle.toLowerCase();
    if (recommendationOptions[recommendationType] && recommendationOptions[recommendationType][displayStyleLower]) {
        const optionToSelect = recommendationOptions[recommendationType][displayStyleLower];
        await display_style.selectOption(optionToSelect);
    } 
    await Customise_SaveChanges(iframe, page);
    await ReloadandWait_Newpage(newPage);
    let newWidg  ; 
    switch(displayStyle.toLowerCase()){
        case 'grid':
            await addToCart(newPage);
            newWidg = await WidgetIsDisplayed(newPage,widgetID);
            let grid;
            if(recommendationType==='quantity'){
                grid = await newWidg.locator('.sf-up-sell-quantity-grid');
            }else if(recommendationType==='variant'){
                grid = await newWidg.locator('.sf-up-sell-variant-grid');
            }else if(recommendationType==='custom'){
                grid = await newWidg.locator('.sf-us-custom-grid');
            }
            await expect(grid).toBeVisible();
            break;
        case 'popup':
            await newPage.locator('.product-form__submit').click();
            await newPage.waitForTimeout(1000);
            const popup = await newPage.locator('#sf-popup-modal');
            await expect(popup).toBeVisible();
            break;
        case 'list':
            await addToCart(newPage);
            newWidg = await WidgetIsDisplayed(newPage,widgetID);
            const list = await newWidg.locator('.sf-product-list');
            await expect(list).toBeVisible();
            break;
    }
}
async function productPriceDisplay(iframe,page,newPage,widgetID,endis_able,pageName){
    const productInfo = await iframe.locator('.sf-view-heading').nth(5);
    const arrowClass = await productInfo.locator('.sf-arrow-down');
    if(await arrowClass.count()===1){
        await productInfo.click({force:true});
    }
    const checkBox = await iframe.locator('.Polaris-Checkbox__Input').first();
    switch(endis_able.toLowerCase()){
        case 'enable':
            if(!await checkBox.isChecked()){
                await checkBox.click();
            }
            break;
        case 'disable':
            if(await checkBox.isChecked()){
                await checkBox.click();
            }
            break;
        default:
            throw new Error(`Unsupported title alignment: ${endis_able}`);
    }
    await Customise_SaveChanges(iframe, page);
    await ReloadandWait_Newpage(newPage);
    if(pageName==='Product page'){
        await addToCart(newPage);
    }
    const newWidg = await WidgetIsDisplayed(newPage,widgetID);
    const firstProduct = await newWidg.locator('.sf-product-item').first();
    const productPrice = await firstProduct.locator('.sf-price-container');
    switch(endis_able.toLowerCase()){
        case 'enable':
            await expect(productPrice).toBeVisible();
            break;
        case 'disable':
            await expect(productPrice).toBeHidden();
            break;
    }        
}
async function product_titleAlignment(iframe,page,newPage,widgetID,title_alignment,pageName){
    const productInfo = await iframe.locator('.sf-view-heading').nth(5);
    const arrowClass = await productInfo.locator('.sf-arrow-down');
    if(await arrowClass.count()===1){
        await productInfo.click({force:true});
    }
    const Alignment = await iframe.locator('.sf-title-alignment .Polaris-Button');
    await page.waitForTimeout(1000);
    switch(title_alignment.toLowerCase()){
        case 'left':
            await Alignment.nth(0).click({force:true});
            break;
        case 'center':
            await Alignment.nth(1).click({force:true});
            break;
        case 'right':
            await Alignment.nth(2).click({force:true});
            break;
        default:
            throw new Error(`Unsupported title alignment: ${title_alignment}`);
    }
    await Customise_SaveChanges(iframe, page);
    await ReloadandWait_Newpage(newPage);
    if(pageName==='Product page'){
        await addToCart(newPage);
    }
    const newWidg = await WidgetIsDisplayed(newPage,widgetID);
    const firstProduct = await newWidg.locator('.sf-product-item').first();
    const productTitle = await firstProduct.locator('.sf-product-title');
    switch(title_alignment.toLowerCase()){
        case 'left':
            await expect(productTitle).toHaveCSS('text-align', /^(left|start)$/);
            break;
        case 'center':
            await expect(productTitle).toHaveCSS('text-align', 'center');
            break;
        case 'right':
            await expect(productTitle).toHaveCSS('text-align', 'right');
            break;
    }
}

// 7. Product title font
async function product_titleFont(iframe,page,newPage,widgetID,pageName){
    const productInfo = await iframe.locator('.sf-view-heading').nth(5);
    const arrowClass = await productInfo.locator('.sf-arrow-down');
    if(await arrowClass.count()===1){
        await productInfo.click({force:true});
    }
    const fontColor = await iframe.locator('.sf-mt-4 .Polaris-TextField__Input');
    await fontColor.nth(0).fill('#ff0000'); //Red color
    await Customise_SaveChanges(iframe, page);
    await ReloadandWait_Newpage(newPage);
    if(pageName==='Product page'){
        await addToCart(newPage);
    }
    const newWidg = await WidgetIsDisplayed(newPage,widgetID);
    const firstProduct = await newWidg.locator('.sf-product-item').first();
    const productTitle = await firstProduct.locator('.sf-product-title');
    await expect(productTitle).toHaveCSS('color','rgb(255, 0, 0)');
}
async function cartbuttonText(iframe,page,newPage,widgetID,edit_cartButton,pageName){
    const actionButton = await iframe.locator('.sf-view-heading').nth(7);
    const arrowClass = await actionButton.locator('.sf-arrow-down');
    if(await arrowClass.count()===1){
        await actionButton.click({force:true});
    }
    const buttonText = await iframe.locator('.Polaris-Labelled--hidden .Polaris-TextField__Input');
    await buttonText.first().fill(edit_cartButton); 
    await Customise_SaveChanges(iframe, page);
    await ReloadandWait_Newpage(newPage);
    if(pageName==='Product page'){
        await addToCart(newPage);
    }
    const newWidg = await WidgetIsDisplayed(newPage,widgetID);
    const cartButton = await newWidg.locator('.sf-fbt-add-to-cart-btn').first();    const chooseOption = await cartButton.locator('.sf-select-btn');
    await expect(cartButton).toHaveText(edit_cartButton);

}
async function cartbutton_Color(iframe,page,newPage,widgetID,pageName){
    const actionButton = await iframe.locator('.sf-view-heading').nth(7);
    const arrowClass = await actionButton.locator('.sf-arrow-down');
    if(await arrowClass.count()===1){
        await actionButton.click({force:true});
    }
    const fontColor = await iframe.locator('.sf-mt-4 .Polaris-TextField__Input');
    await fontColor.nth(1).fill('#ff0000'); //fontColor
    await fontColor.nth(2).fill('#f2dcdc'); //backgroundColor
    await Customise_SaveChanges(iframe, page);
    await ReloadandWait_Newpage(newPage);
    if(pageName==='Product page'){
        await addToCart(newPage);
    }
    const newWidg = await WidgetIsDisplayed(newPage,widgetID);
    const cartButton = await newWidg.locator('.sf-fbt-add-to-cart-btn').first();    const chooseOption = await cartButton.locator('.sf-select-btn');
    await newPage.waitForTimeout(3000);
    await expect(cartButton).toHaveCSS('color','rgb(255, 0, 0)');
    await expect(cartButton).toHaveCSS('background-color','rgb(242, 220, 220)');
}

module.exports ={
    moreQuantity,
    sameProductasUpsell,
    higherPriced,
    highestVariantasUpsell,
    editverify_Title,
    customAll,
    editverify_subtitle,
    Discount,
    discountApplied,
    discountComboCheck,
    NOdiscountcombo,
    desktop_displayStyle,
    productPriceDisplay,
    product_titleAlignment,
    product_titleFont,
    cartbutton_Color,
    cartbuttonText,
    
    
}