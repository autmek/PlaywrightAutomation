const {test,expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const{
    addToCart,
    deleteFromCart,
    login,
    NavigatetoApp,
    FindWidgetID,
    editWidget,
    NavigateToStore,
    WidgetIsDisplayed,
    WidgetNotDisplayed,
    Savewidget,
    ReloadandWait_Newpage,
    NavigateToPage,
} = require('../testUtils/CommonFunctions');
const {
    CreateNewWidget,
    deleteCrossSell,
    addSpecific,
    Discount,
    editverify_subtitle,
    discountCombo,
    discountDisplay,
    discountText,
    discountColor,
    displayStyleCart,
    editverify_Title,
    Verify_variableToCart,
    discountComboCheck,
    scheduleDiscount,
    NOdiscountcombo,
    cartbuttonText,
    cartbutton_Color,
} = require('../testUtils/CrossSell');
const {
    titleAlignment,
    titleFont,
    productPriceDisplay,
    product_titleAlignment,
    product_titleFont,
    responsivePreview,
    cartbuttonDisplay,
} = require('../testUtils/visualPreference');
const {
    userName, passWord, adminURL, adminTitle, appName,
    triggerCollection,productCoupon,orderCoupon,shippingCoupon,couponComboProduct,
    productOnstore,Main_product,Secondary_product,edit_cartButton,postCode,
    edit_discountText,triggerProduct,recom_Products,discount_cent,newSubtitle,
} = require('../testUtils/constants');
let context, iframe, widgetID, newPage, page, storeURL,newWidg;
const newtitle = 'Updated CrossSell - Cart';
const pageName = 'Cart page';
test.beforeAll(async ({browser}) => {
    context = await browser.newContext();
    page = await context.newPage(); 
    await page.goto(adminURL);
    await login(page,userName,passWord,adminTitle); 
    await page.waitForLoadState('load');
    iframe = page.frameLocator('[name=app-iframe]');
    newPage = await NavigateToStore(page);
    storeURL = await newPage.url();
    await page.bringToFront();
    await NavigateToPage(newPage,'Product page',storeURL,productOnstore);
    await addToCart(newPage);
    await NavigateToPage(newPage,pageName,storeURL);
});
test.afterAll(async()=>{
    await context.close();
})
// 1. Create new Widget
test.skip('Create new crossSell widget(All products) for Cart page',{tag:'@CreateNewWidget'}, async()=>{
    fs.writeFileSync(path.resolve(__dirname, 'CrossellCart.json'), JSON.stringify({}));
    await CreateNewWidget(page,iframe,appName,pageName,recom_Products);
    widgetID = await FindWidgetID(iframe);
    fs.writeFileSync(path.resolve(__dirname, 'CrossellCart.json'), JSON.stringify({ widgetID }));
    await ReloadandWait_Newpage(newPage);
    await WidgetIsDisplayed(newPage, widgetID);
});
// 2. Edit widget title
test('Edit title',{tag:'@EditTitle'}, async()=>{
    //widgetID = '0082';
    await NavigatetoApp(page,appName);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    if(!widgetID){
        const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'CrossellCart.json'))); 
        widgetID = data.widgetID;
}
    await editWidget(iframe,page,widgetID);
    await editverify_Title(iframe,page,newPage,widgetID,newtitle);                 
});
// 3. Add Variable product from widget to cart
test('Add variable product from widget to cart', {tag:'@addVariable'},async () => {
    if(!widgetID){
        const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'CrossellCart.json'))); 
        widgetID = data.widgetID;
    }
    await NavigateToPage(newPage,pageName,storeURL);
    await Verify_variableToCart(newPage,widgetID,pageName,storeURL,'CrossSell');
    await NavigateToPage(newPage,'Product page',storeURL,productOnstore);
    await addToCart(newPage);
    await NavigateToPage(newPage,pageName,storeURL);
});
// 4. Products to recommend
test.describe('Products to recommend',{tag:'@RecommendProducts'}, async()=>{
    test.beforeAll(async()=>{
        //widgetID = '0001';
        await NavigatetoApp(page,appName);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        if(!widgetID){
            const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'CrossellCart.json'))); 
            widgetID = data.widgetID;
            }
        await editWidget(iframe,page,widgetID);
        await ReloadandWait_Newpage(newPage)
    })
    test.beforeEach(async()=>{
        await iframe.getByRole('button', {name: /Manage bundles/}).click();
        await page.waitForTimeout(1000);
        await deleteCrossSell(iframe,page);    
    })
    test.afterAll(async()=>{
        await NavigateToPage(newPage,'Product page',storeURL,productOnstore);
        await addToCart(newPage);
        await NavigateToPage(newPage,pageName,storeURL);
        await iframe.getByRole('button', {name: /Manage bundles/}).click();
        await page.waitForTimeout(1000);
        await deleteCrossSell(iframe,page);    
        await addSpecific(iframe,page,'All products',undefined,recom_Products);
        await Savewidget(iframe,page);
    })
    test('Cross-Sell for specific products', async()=>{

        await addSpecific(iframe,page,'Specific product',triggerProduct,recom_Products);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,'Product page',storeURL,Main_product);
        await addToCart(newPage);
        await NavigateToPage(newPage,pageName,storeURL);
        await WidgetIsDisplayed(newPage,widgetID);
        await deleteFromCart(newPage);
        await NavigateToPage(newPage,'Product page',storeURL,Secondary_product);
        await addToCart(newPage);
        await NavigateToPage(newPage,pageName,storeURL);
        await WidgetNotDisplayed(newPage,widgetID);
        await deleteFromCart(newPage);
    });
    
    test.skip('Cross-Sell for specific collection', async()=>{
        await addSpecific(iframe,page,'Specific collection',triggerCollection,recom_Products);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,'Product page',storeURL,Main_product);
        await addToCart(newPage);
        await NavigateToPage(newPage,pageName,storeURL);
        await WidgetIsDisplayed(newPage,widgetID);
        await deleteFromCart(newPage);
        await NavigateToPage(newPage,'Product page',storeURL,Secondary_product);
        await addToCart(newPage);
        await NavigateToPage(newPage,pageName,storeURL);
        await WidgetNotDisplayed(newPage,widgetID);
    });
})
// 5. Discounts
test.describe('Discounts',{tag:'@Discounts'},async()=>{
    test.beforeAll(async()=>{
        //widgetID = '0084';
        await NavigatetoApp(page,appName);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        if(!widgetID){
            const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'CrossellCart.json'))); 
            widgetID = data.widgetID;
            }
        await editWidget(iframe,page,widgetID);
        newWidg = await WidgetIsDisplayed(newPage,widgetID);
    })
    test('Disable Discount',async()=>{
        await Discount(iframe,page,'disable');
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage);
        const discount_onStore = await newWidg.locator('.sf-discount-text');
        await expect(discount_onStore).toBeHidden();

    })
    test('Enable discount',async()=>{
        await Discount(iframe,page,'enable',discount_cent);
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage);
        const discount_onStore = await newWidg.locator('.sf-discount-text');
        await expect(discount_onStore).toBeVisible();
        await newWidg.locator('.sf-fbt-add-to-cart-btn').first().click();
        const firstProduct = await newWidg.locator('.sf-product-item').first();
        const productTitle = await firstProduct.locator('.sf-product-title').innerText();
        const cartItems = await newPage.locator('.cart-items .cart-item .cart-item__details');
        const addedProduct = cartItems.filter({
            has: newPage.locator('.cart-item__name', { hasText: productTitle })
        });
        const cartItemOldPrice = await addedProduct.locator('.cart-item__discounted-prices .cart-item__old-price').innerText();
        const originalPrice = parseFloat(cartItemOldPrice.replace(/[^\d.]/g, ''));
        const discountedPrice = await addedProduct.locator('.cart-item__discounted-prices .cart-item__final-price').innerText();
        const finalPrice = parseFloat(discountedPrice.replace(/[^\d.]/g, ''));
        const DiscountAmount = ((originalPrice - finalPrice)/originalPrice)*100;
        expect(DiscountAmount.toString()).toEqual(discount_cent);
        await deleteFromCart(newPage);
        await NavigateToPage(newPage,'Product page',storeURL,productOnstore);
        await addToCart(newPage);
        await NavigateToPage(newPage,pageName,storeURL);    
    })
    test('Edit DiscountText', async()=>{
        await editverify_subtitle(page,newPage,iframe,newSubtitle,widgetID);
    })
});
// 6. Discount Combination
test.describe('Discount Combination',{tag:'@Discounts'},async()=>{
    test.beforeAll(async()=>{
        //widgetID = '0082';
        await NavigatetoApp(page,appName);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        if(!widgetID){
            const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'CrossellCart.json'))); 
            widgetID = data.widgetID;
        }    
        await editWidget(iframe,page,widgetID);
        await Discount(iframe,'enable',discount_cent);
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage);
        newWidg = await WidgetIsDisplayed(newPage,widgetID);
        const discount_onStore = await newWidg.locator('.sf-discount-text');
        await expect(discount_onStore).toBeVisible();
    })
    test.afterEach(async()=>{
        await NavigateToPage(newPage,pageName,storeURL);
        await deleteFromCart(newPage);
    })
    test.afterAll(async()=>{
        await NavigateToPage(newPage,'Product page',storeURL,productOnstore);
        await addToCart(newPage);
        await NavigateToPage(newPage,pageName,storeURL);
    })
    test('Other product discounts',async()=>{
        await discountCombo(iframe,'enable','product');
        await Savewidget(iframe,page);
        await deleteFromCart(newPage);
        await NavigateToPage(newPage,'Product page',storeURL,couponComboProduct);
        await addToCart(newPage);
        await NavigateToPage(newPage,'Product page',storeURL,productOnstore);
        await addToCart(newPage);
        await NavigateToPage(newPage,pageName,storeURL);
        await discountComboCheck(newPage,newWidg,storeURL,pageName,productCoupon);
    })
    test('Order discounts',async()=>{
        await discountCombo(iframe,'enable','order');
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,'Product page',storeURL,productOnstore);
        await addToCart(newPage);
        await NavigateToPage(newPage,pageName,storeURL);
        await discountComboCheck(newPage,newWidg,storeURL,pageName,orderCoupon);
    })
    test('Shipping discounts',async()=>{
        await discountCombo(iframe,'enable','shipping');
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,'Product page',storeURL,productOnstore);
        await addToCart(newPage);
        await NavigateToPage(newPage,pageName,storeURL);
        await discountComboCheck(newPage,newWidg,storeURL,pageName,shippingCoupon,'shipping',postCode);
    })
    test('No discount combo',async()=>{
        await discountCombo(iframe,'disable');
        await Savewidget(iframe,page);
        await deleteFromCart(newPage);
        await NavigateToPage(newPage,'Product page',storeURL,couponComboProduct);
        await addToCart(newPage);
        await NavigateToPage(newPage,'Product page',storeURL,productOnstore);
        await addToCart(newPage);
        await NavigateToPage(newPage,pageName,storeURL);
        await NOdiscountcombo(newPage,newWidg,pageName,storeURL);
    })
    test('Schedule discounts',async()=>{
        // Future date
        await scheduleDiscount(iframe,false);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,'Product page',storeURL,productOnstore);
        await addToCart(newPage);
        await NavigateToPage(newPage,pageName,storeURL);
        const discount_onStore = await newWidg.locator('.sf-discount-text');
        await expect(discount_onStore).toBeHidden();
        // Current date
        await scheduleDiscount(iframe,true);
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage);
        await expect(discount_onStore).toBeVisible();
    })
});
// 7. Customization
test.describe('Customize widget',{tag:'@Customization'},async()=>{
    test.beforeAll(async()=>{
        //widgetID = '0001';
        await NavigatetoApp(page,appName);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        if(!widgetID){
            const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'CrossellCart.json'))); 
            widgetID = data.widgetID;
        }
        await editWidget(iframe,page,widgetID);
        await ReloadandWait_Newpage(newPage)
        await WidgetIsDisplayed(newPage,widgetID);
        await iframe.locator(`.sf-settings-btn`).nth(1).scrollIntoViewIfNeeded();
        await iframe.locator('.widget-settings-button').click(); //Customize
        await page.waitForTimeout(3000);
    });
    test.afterAll(async()=>{
        await iframe.locator('.Polaris-FullscreenBar__BackAction').click();
    });
    test('Dislay_Style(On Desktop) - Popup', async()=>{
        await displayStyleCart(iframe,page,newPage,widgetID,'popup');
    });
    test('Dislay_Style(On Desktop) - Grid', async()=>{
        await displayStyleCart(iframe,page,newPage,widgetID,'grid');
    });

    test('Widget title Alignment - Left', async()=>{    
        await titleAlignment(iframe,page,newPage,widgetID,'left');
    });

    test('Widget title Alignment - Center', async()=>{    
        await titleAlignment(iframe,page,newPage,widgetID,'Center');
    });

    test('Widget title Alignment - Right', async()=>{    
        await titleAlignment(iframe,page,newPage,widgetID,'Right');
    });
    test('Widget title font color', async()=>{    
        await titleFont(iframe,page,newPage,widgetID);
    });
    test('Product price Display', async()=>{    
        await productPriceDisplay(iframe,page,newPage,widgetID,'disable');
        await page.waitForTimeout(2000);
        await productPriceDisplay(iframe,page,newPage,widgetID,'enable');
    });
    test('Product title alignment - Left', async()=>{    
        await product_titleAlignment(iframe,page,newPage,widgetID,'left');
    });

    test('Product title alignment - Center', async()=>{    
        await product_titleAlignment(iframe,page,newPage,widgetID,'center');
    });

    test('Product title alignment - Right', async()=>{    
        await product_titleAlignment(iframe,page,newPage,widgetID,'right');
    });
    test('Product title font', async()=>{    
        await product_titleFont(iframe,page,newPage,widgetID);
    });
    test('Discount text display', async()=>{    
        await discountDisplay(iframe,page,newPage,widgetID,'disable');
        await page.waitForTimeout(2000);
        await discountDisplay(iframe,page,newPage,widgetID,'enable');
    });
    test('Edit Discount Text',async()=>{
        await discountText(iframe,page,newPage,widgetID,edit_discountText);
    });
    test('Edit Discount Color',async()=>{
        await discountColor(iframe,page,newPage,widgetID);
    });
    test('Cart button display', async()=>{    
        await cartbuttonDisplay(iframe,page,newPage,widgetID,'disable');
        await page.waitForTimeout(2000);
        await cartbuttonDisplay(iframe,page,newPage,widgetID,'enable');
    })
    test('Cart button text', async()=>{    
        await cartbuttonText(iframe,page,newPage,widgetID,edit_cartButton);
    });
    test('Cart button colors', async()=>{
        await cartbutton_Color(iframe,page,newPage,widgetID);
    });
    test('Responsiveness of the preview section', async()=>{    
        await responsivePreview(iframe,page);
    });

});
