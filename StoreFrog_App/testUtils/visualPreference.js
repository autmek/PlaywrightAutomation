const { expect } = require('@playwright/test');
const{
    ReloadandWait_Newpage,
    WidgetIsDisplayed,
    addToCart,
} = require('./CommonFunctions');

// 1. The total number of products to display
async function totalNumberOf_ProductonWidget(page,newPage,iframe,widgetID,total_productsOn){
    const RangeSlider = iframe.locator('.Polaris-RangeSlider-SingleThumb__Input');
    const slider_1 = RangeSlider.first();
    await setRangeSliderValue(slider_1, total_productsOn); 
    await Customise_SaveChanges(iframe, page);
    await ReloadandWait_Newpage(newPage);
    const newWidg = await WidgetIsDisplayed(newPage,widgetID);
    const productsOnWidget = await newWidg.locator('.sf-product-item');
    const Count_productsOnWidget = await productsOnWidget.count();
    expect(Count_productsOnWidget).toBe(parseInt(total_productsOn));
}

// 2. Dislay_Style(On Desktop) - Grid/ Slider/ List
async function desktop_displayStyle(iframe,page,newPage,widgetID,products_perRow,displayStyle){
    const RangeSlider = iframe.locator('.Polaris-RangeSlider-SingleThumb__Input');
    const display_style = await iframe.locator('select.Polaris-Select__Input').first();
    const slider_2 = RangeSlider.nth(1);
    switch(displayStyle.toLowerCase()){
        case 'grid':
            await display_style.selectOption('grid');
            await setRangeSliderValue(slider_2, products_perRow); 
            break;
        case 'slider':
            await display_style.selectOption('carousel');
            await setRangeSliderValue(slider_2, products_perRow); 
            break;
        case 'list':
            await display_style.selectOption('list');
            break;
        default:
            throw new Error(`Unsupported display style: ${displayStyle}`);
    }
    await Customise_SaveChanges(iframe, page);
    await ReloadandWait_Newpage(newPage);    
    const newWidg = await WidgetIsDisplayed(newPage,widgetID);
    switch(displayStyle.toLowerCase()){
        case 'grid':
            const grid = await newWidg.locator('.sf-product-grid');
            await expect(grid).toBeVisible();
            await expect(grid).toHaveCSS('--sf-grid-count' , products_perRow);
            break;
        case 'slider':
            const slider = await newWidg.locator('.sf-slider');
            await expect(slider).toBeVisible();
            const productItems = await slider.locator('.sf-product-item');
            const widget_totalWidth = await slider.evaluate(el => el.clientWidth);
            const single_productWidth = await productItems.first().evaluate(el => el.clientWidth);
            const items_perRow = Math.round((widget_totalWidth + 30) / (single_productWidth + 30));
            expect(items_perRow).toBe(parseInt(products_perRow));
            break;
        case 'list':
            const list = await newWidg.locator('.sf-list');
            await expect(list).toBeVisible();
            break;
    }
}

// 3. Widget title Alignment
async function titleAlignment(iframe,page,newPage,widgetID,title_alignment){
    const Alignment = await iframe.locator('.sf-title-alignment .Polaris-Button');
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
    const newWidg = await WidgetIsDisplayed(newPage,widgetID);
    const widgetTitle = await newWidg.locator('.sf-widget-title');
    switch(title_alignment.toLowerCase()){
        case 'left':
            await expect(widgetTitle).toHaveCSS('text-align', /^(left|start)$/);
            break;
        case 'center':
            await expect(widgetTitle).toHaveCSS('text-align', 'center');
            break;
        case 'right':
            await expect(widgetTitle).toHaveCSS('text-align', 'right');
            break;
    }
}

// 4. Widget title font color
async function titleFont(iframe,page,newPage,widgetID){
    const fontColor = await iframe.locator('.sf-mt-4 .Polaris-TextField__Input');
    await fontColor.first().fill('#ff0000'); //Red color
    await Customise_SaveChanges(iframe, page);
    await ReloadandWait_Newpage(newPage);
    const newWidg = await WidgetIsDisplayed(newPage,widgetID);
    const widgetTitle = await newWidg.locator('.sf-widget-title');
    await expect(widgetTitle).toHaveCSS('color','rgb(255, 0, 0)');
}

// 5. Product price Display
async function productPriceDisplay(iframe,page,newPage,widgetID,endis_able){
    const productInfo = await iframe.locator('.sf-view-heading').nth(6);
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

// 6. Product title alignment
async function product_titleAlignment(iframe,page,newPage,widgetID,title_alignment){
    const productInfo = await iframe.locator('.sf-view-heading').nth(6);
    const arrowClass = await productInfo.locator('.sf-arrow-down');
    if(await arrowClass.count()===1){
        await productInfo.click({force:true});
    }
    const Alignment = await iframe.locator('.sf-title-alignment .Polaris-Button');
    await page.waitForTimeout(1000);
    switch(title_alignment.toLowerCase()){
        case 'left':
            await Alignment.nth(3).click({force:true});
            break;
        case 'center':
            await Alignment.nth(4).click({force:true});
            break;
        case 'right':
            await Alignment.nth(5).click({force:true});
            break;
        default:
            throw new Error(`Unsupported title alignment: ${title_alignment}`);
    }
    await Customise_SaveChanges(iframe, page);
    await ReloadandWait_Newpage(newPage);
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
async function product_titleFont(iframe,page,newPage,widgetID){
    const productInfo = await iframe.locator('.sf-view-heading').nth(6);
    const arrowClass = await productInfo.locator('.sf-arrow-down');
    if(await arrowClass.count()===1){
        await productInfo.click({force:true});
    }

    const fontColor = await iframe.locator('.sf-mt-4 .Polaris-TextField__Input');
    await fontColor.nth(1).fill('#ff0000'); //Red color
    await Customise_SaveChanges(iframe, page);
    await ReloadandWait_Newpage(newPage);
    const newWidg = await WidgetIsDisplayed(newPage,widgetID);
    const firstProduct = await newWidg.locator('.sf-product-item').first();
    const productTitle = await firstProduct.locator('.sf-product-title');
    await expect(productTitle).toHaveCSS('color','rgb(255, 0, 0)');
}

// 8. Cart button display
async function cartbuttonDisplay(iframe,page,newPage,widgetID,endis_able){
    const actionButton = await iframe.locator('.sf-view-heading').nth(8);
    const arrowClass = await actionButton.locator('.sf-arrow-down');
    if(await arrowClass.count()===1){
        await actionButton.click({force:true});
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
    const firstProduct = await newWidg.locator('.sf-product-item').first();
    const cartButton = await firstProduct.locator('.sf-cart-container');
    switch(endis_able.toLowerCase()){
        case 'enable':
            await expect(cartButton).toBeVisible();
            break;
        case 'disable':
            await expect(cartButton).toBeHidden();
            break;
    }        
}

// 9. Cart button text (Add-to-cart & Select-option)
async function cartbuttonText(iframe,page,newPage,widgetID,edit_cartButton,edit_chooseButton){
    const actionButton = await iframe.locator('.sf-view-heading').nth(8);
    const arrowClass = await actionButton.locator('.sf-arrow-down');
    if(await arrowClass.count()===1){
        await actionButton.click({force:true});
    }
    const buttonText = await iframe.locator('.Polaris-Labelled--hidden .Polaris-TextField__Input');
    await buttonText.first().fill(edit_cartButton); //Edit Add_toCart button
    await buttonText.nth(1).fill(edit_chooseButton); //Edit ChooseOption button
    await Customise_SaveChanges(iframe, page);
    await ReloadandWait_Newpage(newPage);
    const newWidg = await WidgetIsDisplayed(newPage,widgetID);
    const firstProduct = await newWidg.locator('.sf-product-item').first();
    const cartButton = await firstProduct.locator('.sf-cart-container');
    const addTocart = await cartButton.locator('.sf-add-to-cart-btn');
    const chooseOption = await cartButton.locator('.sf-select-btn');
    await expect(addTocart).toHaveText(edit_cartButton);
    await expect(chooseOption).toHaveText(edit_chooseButton);

}

// 10. Cart button action 
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
    const currentURL = await newPage.url();
    const addToCart = await newWidg.locator('.sf-add-to-cart-btn[style*="display: block"]').first();    
    await addToCart.click();
    await newPage.waitForTimeout(3000);
    switch(buttonAction.toLowerCase()){
        case 'redirect to cart':
            await expect(newPage).toHaveTitle(/Cart/);
            await newPage.goBack();
            break;
        case 'stay on page':
            await expect(newPage).toHaveURL(currentURL);
            break;
        case 'redirect to checkout':
            await expect(newPage).toHaveTitle(/Checkout/);
            await newPage.goBack();
            break;
    }
}

// 11. Cart button colors
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
    const firstProduct = await newWidg.locator('.sf-product-item').first();
    const cartButton = await firstProduct.locator('.sf-cart-container');
    const addTocart = await cartButton.locator('.sf-add-to-cart-btn');
    await newPage.waitForTimeout(3000);
    await expect(addTocart).toHaveCSS('color','rgb(255, 0, 0)');
    await expect(addTocart).toHaveCSS('background-color','rgb(242, 220, 220)');
}

// 12. Responsiveness of the preview section
async function responsivePreview(iframe,page){
    const responsiveButton = await iframe.locator('.sf-preview-list');
    const previewCard = await iframe.locator('.sf-preview-viewport');

    // Desktop
    await responsiveButton.first().click();
    await page.waitForTimeout(500);
    await expect(previewCard).toHaveAttribute('data-view-port','desktop');

    // Tab
    await responsiveButton.nth(1).click();
    await page.waitForTimeout(500);
    await expect(previewCard).toHaveAttribute('data-view-port','tablet');

    // Mobile
    await responsiveButton.nth(2).click();
    await page.waitForTimeout(500);
    await expect(previewCard).toHaveAttribute('data-view-port','mobile');
}

async function setRangeSliderValue(slider, targetValue) {
    // Focus on the slider to start sending keypress events
    await slider.focus();
    // Get the current slider value
    let currentValue = await slider.evaluate(el => parseFloat(el.value));
    // Move the slider to the target value
    while (currentValue < targetValue) {
        await slider.press('ArrowRight');
        currentValue = await slider.evaluate(el => parseFloat(el.value)); // Update the current value
    }
    while (currentValue > targetValue) {
        await slider.press('ArrowLeft');
        currentValue = await slider.evaluate(el => parseFloat(el.value)); // Update the current value
    }
}
async function Customise_SaveChanges(iframe, page){
    await page.waitForLoadState('load');
    await iframe.locator('.sf-fullscreen-group .Polaris-Button').last().click();
    const changes_Saved = await iframe.locator('text="Changes saved."');
    await changes_Saved.waitFor({ state: 'visible', timeout: 5000 });
    await expect(changes_Saved).toBeVisible();
    await page.waitForLoadState('networkidle');
    await iframe.locator('.sf-fullscreen-group .Polaris-Button').last().click();
    await iframe.locator('.sf-fullscreen-group .Polaris-Button').last().click();
    await page.waitForLoadState('load');
}

module.exports = { 
    totalNumberOf_ProductonWidget,
    desktop_displayStyle,
    titleAlignment,
    titleFont,
    productPriceDisplay,
    product_titleAlignment,
    product_titleFont,
    cartbuttonDisplay,
    cartbuttonText,
    cartbutton_Action,
    cartbutton_Color,
    responsivePreview,
    setRangeSliderValue,
    Customise_SaveChanges

}
