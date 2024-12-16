const {test,expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const{
    addToCart,
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
    CreateNewWidget,
    deleteFromCart,
} = require('../testUtils/CommonFunctions');

const {
    deleteCrossSell,
    addSpecific,
    verifyDiscountonStore,
    discountCombo,
    discountText,
    discountColor,
    Verify_variableToCart,
    scheduleDiscount,

} = require('../testUtils/CrossSell');
const {
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
} = require('../testUtils/Upsell');
const {
    responsivePreview,
} = require('../testUtils/visualPreference');
const {
    userName, passWord, adminURL, adminTitle, appName,
    triggerCollection,productCoupon,orderCoupon,shippingCoupon,couponComboProduct,
    productOnstore,Main_product,Secondary_product,postCode,
    edit_discountText,triggerProduct,recom_Products,discount_cent,newSubtitle,
    triggerVariant,secondaryVariant,edit_cartButton,
} = require('../testUtils/constants');
let context, iframe, widgetID, newPage, page, storeURL,newWidg;
let recommendationType;
const newtitle = 'Updated Upsell - PP';
const pageName = 'Product page';

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
    await NavigateToPage(newPage,pageName,storeURL,productOnstore);
});

test.afterAll(async()=>{
    await context.close();
})
// 1. Create new Widget
test.skip('Create new Upsell widget for Product page',{tag:'@CreateNewWidget'}, async()=>{
    fs.writeFileSync(path.resolve(__dirname, 'UpsellPP.json'), JSON.stringify({}));
    await CreateNewWidget(page,iframe,appName,pageName,'Upsell');
    widgetID = await FindWidgetID(iframe);
    fs.writeFileSync(path.resolve(__dirname, 'UpsellPP.json'), JSON.stringify({ widgetID }));
    await ReloadandWait_Newpage(newPage);
    await addToCart(newPage);
    await WidgetIsDisplayed(newPage, widgetID);
});
// 2. Edit widget title
test('Edit widget title',{tag:'@EditTitle'}, async()=>{
    //widgetID = '0082';
    await NavigatetoApp(page,appName);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    if(!widgetID){
        const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'UpsellPP.json'))); 
        widgetID = data.widgetID;
    }
    await editWidget(iframe,page,widgetID);
    await editverify_Title(iframe,page,newPage,widgetID,newtitle);                 
});

// 4. Products to recommend
test.describe('More quantity as upsell',{tag:'@RecommendProducts'},async()=>{
    test.beforeAll(async()=>{
        //widgetID = '0097';
        await NavigatetoApp(page,appName);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        if(!widgetID){
            const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'UpsellPP.json'))); 
            widgetID = data.widgetID;
        }
        await editWidget(iframe,page,widgetID);
        await NavigateToPage(newPage,pageName,storeURL,productOnstore);
        await addToCart(newPage);
        await WidgetIsDisplayed(newPage, widgetID);
    })
    test.beforeEach(async()=>{
        await iframe.locator('.Polaris-Checkbox__Input').first().click();
    })
    test('Specific Product',async()=>{
        await moreQuantity(iframe,page,'Specific products',triggerProduct);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,triggerProduct);
        await addToCart(newPage);
        await sameProductasUpsell(newPage,widgetID,triggerProduct);
        await NavigateToPage(newPage,pageName,storeURL,Secondary_product);
        await addToCart(newPage);
        await WidgetNotDisplayed(newPage, widgetID);
    })
    test('Specific Collection',async()=>{
        await moreQuantity(iframe,page,'Specific collections',triggerCollection);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,Main_product);
        await addToCart(newPage);
        await sameProductasUpsell(newPage,widgetID,Main_product);
        await NavigateToPage(newPage,pageName,storeURL,Secondary_product);
        await addToCart(newPage);
        await WidgetNotDisplayed(newPage, widgetID);
    })
});
// Higher Priced Variant
test.describe('Higher Priced Variant',{tag:'@RecommendProducts'}, async()=>{
    test.beforeAll(async()=>{
        //widgetID = '0097';
        await NavigatetoApp(page,appName);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        if(!widgetID){
            const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'UpsellPP.json'))); 
            widgetID = data.widgetID;
            }
        await editWidget(iframe,page,widgetID);
        await NavigateToPage(newPage,pageName,storeURL,productOnstore);
        await addToCart(newPage);
        await WidgetIsDisplayed(newPage, widgetID);
    })
    test.beforeEach(async()=>{
        await iframe.locator('.Polaris-Checkbox__Input').nth(1).click();
    })
    test('All Products',async()=>{
        await higherPriced(iframe,page,'All products');
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,triggerVariant);
        await addToCart(newPage);
        await sameProductasUpsell(newPage,widgetID,triggerVariant);
        await highestVariantasUpsell(newPage,widgetID);
    })
    test('Specific Products',async()=>{
        await higherPriced(iframe,page,'Specific products',triggerVariant);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,triggerVariant);
        await addToCart(newPage);
        await sameProductasUpsell(newPage,widgetID,triggerVariant);
        await highestVariantasUpsell(newPage,widgetID);
        await NavigateToPage(newPage,pageName,storeURL,secondaryVariant);
        await addToCart(newPage);
        await WidgetNotDisplayed(newPage, widgetID);
    })
    test('Specific Collections',async()=>{
        await higherPriced(iframe,page,'Specific collections',triggerCollection);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,triggerVariant);
        await addToCart(newPage);
        await sameProductasUpsell(newPage,widgetID,triggerVariant);
        await highestVariantasUpsell(newPage,widgetID);
        await NavigateToPage(newPage,pageName,storeURL,secondaryVariant);
        await addToCart(newPage);
        await WidgetNotDisplayed(newPage, widgetID);
    })
});
test.describe('Custom Products',{tag:'@RecommendProducts'}, async()=>{
    test.beforeAll(async()=>{
        //widgetID = '0097';
        await NavigatetoApp(page,appName);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        if(!widgetID){
            const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'UpsellPP.json'))); 
            widgetID = data.widgetID;
            }
        await editWidget(iframe,page,widgetID);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
    })
    test.beforeEach(async()=>{
        await iframe.locator('.Polaris-Checkbox__Input').nth(2).click();
        await iframe.getByRole('button', {name: /Manage bundles/}).click();
        await deleteCrossSell(iframe,page);
    })
    test.afterAll(async()=>{
        await iframe.getByRole('button', {name: /Manage bundles/}).click();
        await deleteCrossSell(iframe,page);    
        await addSpecific(iframe,page,'All products',undefined,recom_Products);
        await Savewidget(iframe,page);
    })
    test('All Products',async()=>{
        const newModal = await iframe.locator('.Polaris-Modal-Dialog__Modal');
        const newModalVisible = await newModal.isVisible();
        if(newModalVisible){
            await customAll(iframe,page);
        }else{
            await addSpecific(iframe,page,'All products',undefined,recom_Products);
        }
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage);
        await addToCart(newPage);
        await WidgetIsDisplayed(newPage,widgetID);
    });
    test.skip('Specific Collections',async()=>{
        await addSpecific(iframe,page,'Specific collection',triggerCollection,recom_Products);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,Main_product);
        await addToCart(newPage);
        await WidgetIsDisplayed(newPage,widgetID);
        await NavigateToPage(newPage,pageName,storeURL,Secondary_product);
        await addToCart(newPage);
        await WidgetNotDisplayed(newPage,widgetID);
    });
    test('Specific Products',async()=>{
        await addSpecific(iframe,page,'Specific product',triggerProduct,recom_Products);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,triggerProduct);
        await addToCart(newPage);
        await WidgetIsDisplayed(newPage,widgetID);
        await NavigateToPage(newPage,pageName,storeURL,Secondary_product);
        await addToCart(newPage);
        await WidgetNotDisplayed(newPage,widgetID);
    });

});
// Add Variable product from widget to cart
test('Add variable product from widget to cart', {tag:'@addVariable'},async () => {
    if(!widgetID){
        const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'UpsellPP.json'))); 
        widgetID = data.widgetID;
    }
    await NavigateToPage(newPage,pageName,storeURL,productOnstore);
    await addToCart(newPage);
    await Verify_variableToCart(newPage,widgetID,pageName,storeURL,'Upsell');
});

test.describe('Discounts',{tag:'@Discounts'},async()=>{
    test.beforeAll(async()=>{
        //widgetID = '0097';
        await NavigatetoApp(page,appName);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        if(!widgetID){
            const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'UpsellPP.json'))); 
            widgetID = data.widgetID;
            }
        await editWidget(iframe,page,widgetID);
        await ReloadandWait_Newpage(newPage);
        await addToCart(newPage);
        newWidg = await WidgetIsDisplayed(newPage,widgetID);
    })
    test('Disable Discount',async()=>{
        await Discount(iframe,page,'disable');
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage);
        await addToCart(newPage);
        await verifyDiscountonStore(newWidg,'disable');
    })
    test('Enable discount',async()=>{
        await Discount(iframe,page,'enable',discount_cent);
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage);
        await addToCart(newPage);
        await discountApplied(newWidg,newPage,storeURL,'enable',discount_cent);
    })
    test('Edit DiscountText', async()=>{
        await editverify_subtitle(page,newPage,iframe,newSubtitle,widgetID);
    })
});
test.describe('Discount Combination',{tag:'@Discounts'}, async()=>{
    test.beforeAll(async()=>{
        //widgetID = '0082';
        await NavigatetoApp(page,appName);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        if(!widgetID){
            const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'UpsellPP.json'))); 
            widgetID = data.widgetID;
        }    
        await editWidget(iframe,page,widgetID);
        await Discount(iframe,page,'enable',discount_cent);
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage);
        await addToCart(newPage);
        newWidg = await WidgetIsDisplayed(newPage,widgetID);
        const discount_onStore = await newWidg.locator('.sf-discount-text');
        await expect(discount_onStore).toBeVisible();
    })
    test.afterEach(async()=>{
        await NavigateToPage(newPage,'Cart page',storeURL);
        await deleteFromCart(newPage);
    })
    test.afterAll(async()=>{
        await NavigateToPage(newPage,pageName,storeURL,productOnstore);
    })
    test('Other product discounts',async()=>{
        await discountCombo(iframe,'enable','product');
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,couponComboProduct);
        await addToCart(newPage);
        await NavigateToPage(newPage,pageName,storeURL,productOnstore);
        await discountComboCheck(newPage,newWidg,storeURL,pageName,productCoupon);
    })
    test('Order discounts',async()=>{
        await discountCombo(iframe,'enable','order');
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,productOnstore);
        await discountComboCheck(newPage,newWidg,storeURL,pageName,orderCoupon);
    })
    test('Shipping discounts',async()=>{
        await discountCombo(iframe,'enable','shipping');
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,productOnstore);
        await discountComboCheck(newPage,newWidg,storeURL,pageName,shippingCoupon,'shipping',postCode);
    })
    test('No discount combo',async()=>{
        await discountCombo(iframe,'disable');
        await Savewidget(iframe,page);
        await deleteFromCart(newPage);
        await NavigateToPage(newPage,'Product page',storeURL,couponComboProduct);
        await addToCart(newPage);
        await NavigateToPage(newPage,'Product page',storeURL,productOnstore);
        await NOdiscountcombo(newPage,newWidg,pageName,storeURL);
    })

    test('Schedule discounts',async()=>{
        // Future date
        await scheduleDiscount(iframe,false);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,productOnstore);
        await ReloadandWait_Newpage(newPage);
        await addToCart(newPage);
        const discount_onStore = await newWidg.locator('.sf-discount-text');
        await expect(discount_onStore).toBeHidden();
        // Current date
        await scheduleDiscount(iframe,true);
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage);
        await addToCart(newPage);
        await expect(discount_onStore).toBeVisible();
    })
});

test.describe.only('Customize widget',{tag:'@Customization'},async()=>{
    test.beforeAll(async()=>{
        //widgetID = '0001';
        await NavigatetoApp(page,appName);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        if(!widgetID){
            const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'UpsellPP.json'))); 
            widgetID = data.widgetID;
        }
        await editWidget(iframe,page,widgetID);
        await page.waitForTimeout(3000);
        const checkBox = await iframe.locator('.Polaris-Checkbox__Input');
        const quantity = await checkBox.first().isChecked();
        const variant = await checkBox.nth(1).isChecked();
        const custom = await checkBox.nth(2).isChecked();
        if(quantity){
            recommendationType = 'quantity';
        }else if(variant){
            recommendationType = 'variant';
        }else if(custom){
            recommendationType = 'custom';
        }
        await iframe.locator(`.sf-settings-btn`).last().scrollIntoViewIfNeeded();
        await iframe.locator('.widget-settings-button').click(); //Customize
        await page.waitForTimeout(3000);
    });
    test.afterAll(async()=>{
        await iframe.locator('.Polaris-FullscreenBar__BackAction').click();
    });
    test('Dislay_Style(On Desktop) - Grid', async()=>{
        await desktop_displayStyle(iframe,page,newPage,widgetID,'grid',recommendationType);
    });
    test('Dislay_Style(On Desktop) - Popup', async()=>{
        await desktop_displayStyle(iframe,page,newPage,widgetID,'popup',recommendationType);
    });
    test('Dislay_Style(On Desktop) - List', async()=>{
        await desktop_displayStyle(iframe,page,newPage,widgetID,'list',recommendationType);
    });
    test('Product price Display', async()=>{    
        await productPriceDisplay(iframe,page,newPage,widgetID,'disable','Product page');
        await page.waitForTimeout(2000);
        await productPriceDisplay(iframe,page,newPage,widgetID,'enable','Product page');
    });
    test('Product title alignment - Left', async()=>{    
        await product_titleAlignment(iframe,page,newPage,widgetID,'left','Product page');
    });

    test('Product title alignment - Center', async()=>{    
        await product_titleAlignment(iframe,page,newPage,widgetID,'center','Product page');
    });

    test('Product title alignment - Right', async()=>{    
        await product_titleAlignment(iframe,page,newPage,widgetID,'right','Product page');
    });
    test('Product title font', async()=>{    
        await product_titleFont(iframe,page,newPage,widgetID,'upProduct pagesell');
    });
    test('Edit Discount Text',async()=>{
        await discountText(iframe,page,newPage,widgetID,edit_discountText,'Product page');
    });
    test('Edit Discount Color',async()=>{
        await discountColor(iframe,page,newPage,widgetID);
    });
    test('Responsiveness of the preview section', async()=>{    
        await responsivePreview(iframe,page);
    });
    test('Cart button text', async()=>{    
        await cartbuttonText(iframe,page,newPage,widgetID,edit_cartButton,'Product page');
    });
    test('Cart button colors', async()=>{
        await cartbutton_Color(iframe,page,newPage,widgetID,'Product page');
    });

});