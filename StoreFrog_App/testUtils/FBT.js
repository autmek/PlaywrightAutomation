const { expect } = require('@playwright/test');
const {
    ReloadandWait_Newpage,
    WidgetIsDisplayed,
    Savewidget,
    NavigateToPage,
    deleteFromCart,
} = require('./CommonFunctions');
const {
    Customise_SaveChanges,
} = require('./visualPreference');
const { productOnstore } = require('./constants');

async function deleteAllotherRecommendation(iframe,page){
    let deleteCount;    
    const Gridcell = await iframe.locator('.Polaris-Grid-Cell');
    const manual_Grid = await Gridcell.first();
    const global_Grid = await Gridcell.nth(2);
    const setRecommendation = await Gridcell.locator('.Polaris-Button');

    // Remove ManualRecommendation
    const manualConfigured = await manual_Grid.locator('.sf-mt-12').nth(1);
    if(await manualConfigured.isVisible()){
        await page.waitForTimeout(2000);
        await setRecommendation.first().click({force:true});
        await page.waitForTimeout(2000);
        const confirm_delete = await iframe.locator('.Polaris-Modal-Dialog__Modal .Polaris-Button').nth(2);
        const polaris_Icon = await iframe.locator('.Polaris-Icon .Polaris-Icon__Svg');    
        deleteCount = await polaris_Icon.count();
        if(deleteCount>2){
            while(deleteCount>2){
                await polaris_Icon.nth(2).click();
                await confirm_delete.click();
                await page.waitForTimeout(500);
                deleteCount = await polaris_Icon.count();
            }
        }
        await polaris_Icon.first().click();
    }
    
    const checkbox = await iframe.locator('.Polaris-Choice__Control');

    // Uncheck AutomaticRecommendation
    if(await checkbox.first().isChecked()){
        await checkbox.first().click(); 
    }
    await page.waitForTimeout(500);

    // Remove GlobalRecommendation
    const globalConfigured = await global_Grid.locator('.sf-mt-12').nth(1);
    if(await globalConfigured.isVisible()){
        await page.waitForTimeout(2000);
        await setRecommendation.nth(1).click();
        await page.waitForTimeout(2000);
        const confirm_delete = await iframe.locator('.Polaris-Modal-Dialog__Modal .Polaris-Button').nth(2);
        const polaris_Icon = await iframe.locator('.Polaris-Icon .Polaris-Icon__Svg');
        deleteCount = await polaris_Icon.count();
        if(deleteCount>1){
            while(deleteCount>1){
                await polaris_Icon.nth(1).click();
                await confirm_delete.click();
                await page.waitForTimeout(500);
                deleteCount = await polaris_Icon.count();
            }
        }
        await polaris_Icon.first().click();
    }
    await page.waitForTimeout(1000);
    
    // Uncheck RandomRecommendations
    if(await checkbox.nth(1).isChecked()){
        await checkbox.nth(1).click(); 
    }
    await page.waitForTimeout(500);
}

async function setManualRecommendation(iframe,page,triggerProduct,recom_Products){
    const manual_Gridcell = await iframe.locator('.Polaris-Grid-Cell').first();
    const setRecommendation = await manual_Gridcell.locator('.Polaris-Button');
    await page.waitForTimeout(1000);
    await setRecommendation.click({force:true});
    await page.waitForTimeout(1000);
    await iframe.getByRole('button', {name: 'Add new bundle', exact:true}).click();
    await page.waitForLoadState('load');
    const products_Modal = await page.locator('.Polaris-Modal-Dialog__Modal');
    const search_Bar = await products_Modal.locator('._SearchAreaWrapper_kg3bc_108');
    const product_Bar = await products_Modal.locator('._ResourceListContainer_kg3bc_3');
    const modal_Footer = await products_Modal.locator('.Polaris-Modal-Footer');

    await search_Bar.getByPlaceholder('Search products').fill(triggerProduct);
    await product_Bar.getByText(triggerProduct).nth(1).click();
    await modal_Footer.getByRole('button', {name: 'Select', exact:true}).click();
    await page.waitForLoadState('load');
    for(const manualProducts of recom_Products){
        await search_Bar.getByPlaceholder('Search products').fill(manualProducts);
        await product_Bar.getByText(manualProducts).nth(1).click();
        }
    await modal_Footer.getByRole('button', {name: 'Add', exact:true}).click();
    await iframe.getByRole('button', {name: 'Back', exact:true}).click();

}

async function setAutomaticRecommendation(iframe){
    const checkbox = await iframe.locator('.Polaris-Choice__Control');
    const auto_isChecked = await checkbox.first().isChecked()
    if(!auto_isChecked){
        await checkbox.first().click(); 
    }
}

async function setRandomRecommendation(page,iframe,labels){
    const checkbox = await iframe.locator('.Polaris-Choice__Control');
    const random_isChecked = await checkbox.nth(1).isChecked()
    if(!random_isChecked){
        await checkbox.nth(1).click(); 
    }
    const random_Gridcell = await iframe.locator('.Polaris-Grid-Cell').nth(3);
    const setRecommendation = await random_Gridcell.locator('.Polaris-Button');
    await page.waitForTimeout(1000);
    await setRecommendation.click();
    await iframe.getByText(labels).click();
    await iframe.getByRole('button', {name: 'Back', exact:true}).click();
}

async function setGlobalRecommendation(iframe,page,recom_Products){
    const global_Gridcell = await iframe.locator('.Polaris-Grid-Cell').nth(2);
    const setRecommendation = await global_Gridcell.locator('.Polaris-Button');
    await page.waitForTimeout(1000);
    await setRecommendation.click();
    await iframe.getByRole('button', {name: 'Add recommendations', exact:true}).click();
    await page.waitForLoadState('load');
    const products_Modal = await page.locator('.Polaris-Modal-Dialog__Modal');
    const search_Bar = await products_Modal.locator('._SearchAreaWrapper_kg3bc_108');
    const product_Bar = await products_Modal.locator('._ResourceListContainer_kg3bc_3');
    const modal_Footer = await products_Modal.locator('.Polaris-Modal-Footer');

    for(const globalProducts of recom_Products){
        await search_Bar.getByPlaceholder('Search products').fill(globalProducts);
        await product_Bar.getByText(globalProducts).nth(1).click();
    }
    await modal_Footer.getByRole('button', {name: 'Add', exact:true}).click();
    await iframe.getByRole('button', {name: 'Back', exact:true}).click();

}

async function Price(iframe, optionValue,price){

    const displayCard = await iframe.locator('#basic-collapsible').first();
    await iframe.getByText('Add filter').click(); 
    await iframe.getByText(`Price`).click();
    await displayCard.locator('select.Polaris-Select__Input').selectOption(optionValue);   
    await displayCard.locator('input[type="number"]').fill(price);
}

async function desktop_displayStyle(iframe,page,newPage,widgetID,displayStyle){
    const display_style = await iframe.locator('select.Polaris-Select__Input').first();
    switch(displayStyle.toLowerCase()){
        case 'table':
            await display_style.selectOption('fbt-table');
            break;
        case 'gallery':
            await display_style.selectOption('fbt-gallery');
            break;
        case 'list':
            await display_style.selectOption('fbt-list');
            break;
        default:
            throw new Error(`Unsupported display style: ${displayStyle}`);
    }
    await Customise_SaveChanges(iframe, page);
    await ReloadandWait_Newpage(newPage);    
    const newWidg = await WidgetIsDisplayed(newPage,widgetID);
    switch(displayStyle.toLowerCase()){
        case 'table':
            const table = await newWidg.locator('.sf-fbt-table');
            await expect(table).toBeVisible();
            break;
        case 'gallery':
            const gallery = await newWidg.locator('.sf-fbt-gallery');
            await expect(gallery).toBeVisible();
            break;
        case 'list':
            const list = await newWidg.locator('.sf-fbt-list');
            await expect(list).toBeVisible();
            break;
    }
}

async function ApplyDiscount(iframe,discount_option,discountValue){
    const discountOption = await iframe.locator('.Polaris-Select__Input');
    const discountTextbox = await iframe.locator('.Polaris-TextField__Input').nth(1);
    switch (discount_option.toLowerCase()){
        case 'percentage':
            await discountOption.selectOption('percentage');
            break;
        case 'flat':
            await discountOption.selectOption('flat');
            break;
    }
    await discountTextbox.fill(discountValue);
    const Dtype = await iframe.locator('.Polaris-TextField .Polaris-Text--root').innerText();
    return Dtype;
    
}

async function discountApplied(newWidg,discountValue,Dtype){
    const discountText_onStore = await newWidg.locator('.sf-discount-text');
    await expect(discountText_onStore).toBeVisible();
    const discountText = await discountText_onStore.innerText();
    const expectedText = Dtype === '%' ? `${discountValue}${Dtype}` : `${Dtype}${discountValue}`;
    expect(discountText).toContain(expectedText);

    const tot_Price = await newWidg.locator('.sf-tot-price strong').innerText();
    const original_Price = await newWidg.locator('.sf-original-price').innerText();
    const totalPrice = parseFloat(tot_Price.replace(/[^\d.]/g, ''));
    const originalPrice = parseFloat(original_Price.replace(/[^\d.]/g, ''));

    if(Dtype === '%'){
        const DiscountPercentage = ((originalPrice - totalPrice)/originalPrice)*100;
        expect(DiscountPercentage.toString()).toEqual(discountValue);
    }else{
        const DiscountAmount = (originalPrice - totalPrice);
        expect(DiscountAmount.toString()).toEqual(discountValue);
    }
    return totalPrice;
}
async function discountAddedtoCart(newPage,newWidg,storeURL,totalPrice,pageName){
    await newWidg.locator('.sf-fbt-add-to-cart-btn').click();
    await newPage.waitForTimeout(3000);
    const urlnow = await newPage.url();
    if(! urlnow.includes('cart')){
        await NavigateToPage(newPage,'Cart page',storeURL);
    }
    if(pageName==='Cart page'){
        const cartItems = await newPage.locator('.cart-items .cart-item');
        const deleteProduct = await cartItems.filter({
            has: newPage.locator('.cart-item__name', { hasText: productOnstore })
        });
    await deleteProduct.locator('.quantity__button').first().click();
    await newPage.waitForTimeout(3000);
    }
    const tot_Price = await newPage.locator('.totals__total-value').innerText();
    const cartTotal = parseFloat(tot_Price.replace(/[^\d.]/g, ''));
    expect(cartTotal).toBe(totalPrice);
    await deleteFromCart(newPage);
    await newPage.goBack();
}

async function totalPriceDisplay(iframe,page,newPage,widgetID,endis_able){
    const productInfo = await iframe.locator('.sf-view-heading').nth(6);
    const arrowClass = await productInfo.locator('.sf-arrow-down');
    if(await arrowClass.count()===1){
        await productInfo.click({force:true});
    }
    const checkBox = await iframe.locator('.Polaris-Checkbox__Input').nth(1);
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
    const newWidg = await WidgetIsDisplayed(newPage,widgetID);
    const totalPrice = await newWidg.locator('.sf-total-price');
    switch(endis_able.toLowerCase()){
        case 'enable':
            await expect(totalPrice).toBeVisible();
            break;
        case 'disable':
            await expect(totalPrice).toBeHidden();
            break;
    }        

}
async function cartbuttonDisplay(iframe,page,newPage,widgetID,endis_able){
    const actionButton = await iframe.locator('.sf-view-heading').nth(8);
    const arrowClass = await actionButton.locator('.sf-arrow-down');
    if(await arrowClass.count()===1){
        await actionButton.click({force:true});
    }

    const checkBox = await iframe.locator('.Polaris-Checkbox__Input').nth(2);
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
    const newWidg = await WidgetIsDisplayed(newPage,widgetID);
    const cartButton = await newWidg.locator('.sf-total-price-container .sf-cart-container');
    switch(endis_able.toLowerCase()){
        case 'enable':
            await expect(cartButton).toBeVisible();
            break;
        case 'disable':
            await expect(cartButton).toBeHidden();
            break;
    }        
}

async function cartbuttonText(iframe,page,newPage,widgetID,edit_singleCartButton,edit_bothCartButton,edit_allCartButton){
    const actionButton = await iframe.locator('.sf-view-heading').nth(8);
    const arrowClass = await actionButton.locator('.sf-arrow-down');
    if(await arrowClass.count()===1){
        await actionButton.click({force:true});
    }
    const buttonText = await iframe.locator('.Polaris-Labelled--hidden .Polaris-TextField__Input');
    await buttonText.first().fill(edit_singleCartButton); //Button text for single product
    await buttonText.nth(1).fill(edit_bothCartButton); //Button text for two products
    await buttonText.nth(2).fill(edit_allCartButton); //Button text for multiple products
    await Customise_SaveChanges(iframe, page);
    await ReloadandWait_Newpage(newPage);
    const newWidg = await WidgetIsDisplayed(newPage,widgetID);
    const cartButton = await newWidg.locator('.sf-cart-container');
    const singleCart = await cartButton.locator('.sf-single-cart');
    const twoCart = await cartButton.locator('.sf-two-cart');
    const multiCart = await cartButton.locator('.sf-multi-cart');
    await expect(singleCart).toHaveText(edit_singleCartButton);
    await expect(twoCart).toHaveText(edit_bothCartButton);
    await expect(multiCart).toHaveText(edit_allCartButton);
}

async function cartbutton_Action(iframe,page,newPage,widgetID,buttonAction){
    const actionButton = await iframe.locator('.sf-view-heading').nth(8);
    const arrowClass = await actionButton.locator('.sf-arrow-down');
    if(await arrowClass.count()===1){
        await actionButton.click({force:true});
    }
    const Actionbutton = await iframe.locator('select.Polaris-Select__Input').nth(3);
    switch(buttonAction.toLowerCase()){
        case 'redirect to cart':
            await Actionbutton.selectOption('redirectToCart');
            break;
        case 'stay on page':
            await Actionbutton.selectOption('stayonPage');
            break;
        case 'redirect to checkout':
            await Actionbutton.selectOption('redirectToCheckout');
            break;
        default:
            throw new Error(`Unsupported title alignment: ${buttonAction}`);
    }
    await Customise_SaveChanges(iframe, page);
    await ReloadandWait_Newpage(newPage);
    const newWidg = await WidgetIsDisplayed(newPage,widgetID);
    const currentURL = new URL(await newPage.url());
    const addToCart = await newWidg.locator('.sf-fbt-add-to-cart-btn');    
    await addToCart.click();
    await newPage.waitForTimeout(3000);
    switch(buttonAction.toLowerCase()){
        case 'redirect to cart':
            await expect(newPage).toHaveTitle(/Cart/);
            await newPage.goBack();
            break;
        case 'stay on page':
            const newURL = new URL(await newPage.url());
            expect(newURL.pathname).toBe(currentURL.pathname);            //await expect(newPage).toHaveURL(new RegExp(currentURL));
            break;
        case 'redirect to checkout':
            await expect(newPage).toHaveTitle(/Checkout/);
            await newPage.goBack();
            break;
    }
}

async function cartbutton_Color(iframe,page,newPage,widgetID){
    const actionButton = await iframe.locator('.sf-view-heading').nth(8);
    const arrowClass = await actionButton.locator('.sf-arrow-down');
    if(await arrowClass.count()===1){
        await actionButton.click({force:true});
    }
    const fontColor = await iframe.locator('.sf-mt-4 .Polaris-TextField__Input');
    await fontColor.nth(2).fill('#ff0000'); //fontColor
    await fontColor.nth(3).fill('#f2dcdc'); //backgroundColor
    await Customise_SaveChanges(iframe, page);
    await ReloadandWait_Newpage(newPage);
    const newWidg = await WidgetIsDisplayed(newPage,widgetID);
    const addToCart = await newWidg.locator('.sf-fbt-add-to-cart-btn');    
    await newPage.waitForTimeout(3000);
    await expect(addToCart).toHaveCSS('color','rgb(255, 0, 0)');
    await expect(addToCart).toHaveCSS('background-color','rgb(242, 220, 220)');
}

async function discountDisplay(iframe,page,newPage,widgetID,endis_able){
    const discountButton = await iframe.locator('.sf-view-heading').last();
    const arrowClass = await discountButton.locator('.sf-arrow-down');
    if(await arrowClass.count()===1){
        await discountButton.click({force:true});
    }
    const checkBox = await iframe.locator('.Polaris-Checkbox__Input').last();
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
    const newWidg = await WidgetIsDisplayed(newPage,widgetID);
    const discountText_onStore = await newWidg.locator('.total-price .sf-discount-text');
    switch(endis_able.toLowerCase()){
        case 'enable':
            await expect(discountText_onStore).toBeVisible();
            break;
        case 'disable':
            await expect(discountText_onStore).toBeHidden();
            break;
    }        
}

async function discountText(iframe,page,newPage,widgetID,edit_discountText){
    const discountButton = await iframe.locator('.sf-view-heading').last();
    const arrowClass = await discountButton.locator('.sf-arrow-down');
    if(await arrowClass.count()===1){
        await discountButton.click({force:true});
    }
    const buttonText = await iframe.locator('.Polaris-Labelled--hidden .Polaris-TextField__Input');
    await buttonText.nth(3).fill(edit_discountText); //Button text for multiple products
    await Customise_SaveChanges(iframe, page);
    await ReloadandWait_Newpage(newPage);
    const newWidg = await WidgetIsDisplayed(newPage,widgetID);
    const discountText_onStore = await newWidg.locator('.total-price .sf-discount-text');
    await expect(discountText_onStore).toHaveText(edit_discountText);

}

async function discountColor(iframe,page,newPage,widgetID){
    const discountButton = await iframe.locator('.sf-view-heading').last();
    const arrowClass = await discountButton.locator('.sf-arrow-down');
    if(await arrowClass.count()===1){
        await discountButton.click({force:true});
    }
    const fontColor = await iframe.locator('.sf-mt-4 .Polaris-TextField__Input');
    await fontColor.nth(4).fill('#ff0000'); //fontColor
    await Customise_SaveChanges(iframe, page);
    await ReloadandWait_Newpage(newPage);
    const newWidg = await WidgetIsDisplayed(newPage,widgetID);
    const discountText_onStore = await newWidg.locator('.total-price .sf-discount-text');
    await newPage.waitForTimeout(1000);
    await expect(discountText_onStore).toHaveCSS('color','rgb(255, 0, 0)');
}
async function editverify_Title(iframe,page,newPage,widgetID,newtitle){
    const titlebox = await iframe.locator('.Polaris-TextField__Input').first();
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
    const productContainers = await newWidg.locator('.sf-product-list-item');
    let productIndex = -1;
    let dropdown;
    for (let i = 0; i < await productContainers.count(); i++) {
        dropdown = productContainers.nth(i).locator('select.sf-product-variants-dropdown');
        if (await dropdown.isVisible()) {
            productIndex = i; 
            break; 
        }else {
            if (i === (await productContainers.count()) - 1) {
                console.log('No Variable products in the Recommendation');
            }
        }
    }
    const targetProductContainer = productContainers.nth(productIndex);
    await newPage.waitForTimeout(2000);
    await dropdown.click();
    await dropdown.selectOption({ index: 1 });
    const variableProduct = await targetProductContainer.locator('.sf-product-title').textContent();
    const selectedOption = await dropdown.locator('option:nth-child(2)').textContent();
    const addToCartButton = await newWidg.locator('.sf-fbt-add-to-cart-btn');
    await addToCartButton.click();
    await newPage.waitForTimeout(2000);
    await NavigateToPage(newPage,'Cart page',storeURL);
    const cartItem = await newPage.locator(`.cart-item__details:has-text("${variableProduct}")`);
    const cartOption = await cartItem.locator('dl .product-option dd').innerText();
    expect(cartOption).toContain(selectedOption);
    await deleteFromCart(newPage);
    await newPage.goBack();
}

module.exports = { 
    deleteAllotherRecommendation,
    setManualRecommendation,
    setAutomaticRecommendation,
    setRandomRecommendation,
    setGlobalRecommendation,
    Price,
    desktop_displayStyle,
    ApplyDiscount,
    discountApplied,
    totalPriceDisplay,
    cartbuttonDisplay,
    cartbuttonText,
    cartbutton_Action,
    cartbutton_Color,
    discountDisplay,
    discountText,
    discountColor,
    editverify_Title,
    Verify_variableToCart,
    discountAddedtoCart,
}
