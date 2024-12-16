const {test } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const{
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
    addToCart,
    deleteFromCart,
} = require('../testUtils/CommonFunctions');

const {
    CreateNewWidget,
    deleteCrossSell,
    addSpecific,
    Discount,
    verifyDiscountonStore,
    editverify_subtitle,
    discountCombo,
    desktop_displayStyle,
    discountDisplay,
    discountText,
    discountColor,
    editverify_Title,
    Verify_variableToCart,
    discountAddedtoCart,
    discountComboCheck,
    scheduleDiscount,
    NOdiscountcombo,
} = require('../testUtils/CrossSell');
const {
    titleAlignment,
    titleFont,
    productPriceDisplay,
    product_titleAlignment,
    product_titleFont,
    responsivePreview,
} = require('../testUtils/visualPreference');
const {
    userName, passWord, adminURL, adminTitle, appName,
    triggerCollection,productCoupon,orderCoupon,shippingCoupon,couponComboProduct,
    productOnstore,Main_product,Secondary_product,postCode,
    edit_discountText,triggerProduct,recom_Products,discount_cent,newSubtitle,
} = require('../testUtils/constants');
let context, iframe, widgetID, newPage, page, storeURL,newWidg;
const newtitle = 'Updated CrossSell - PP';
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
test('Create new crossSell widget(All products) for Product page',{tag:'@CreateNewWidget'}, async()=>{
    fs.writeFileSync(path.resolve(__dirname, 'CrossellPP.json'), JSON.stringify({}));
    await CreateNewWidget(page,iframe,appName,pageName,recom_Products);
    widgetID = await FindWidgetID(iframe);
    fs.writeFileSync(path.resolve(__dirname, 'CrossellPP.json'), JSON.stringify({ widgetID }));
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
        const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'CrossellPP.json'))); 
        widgetID = data.widgetID;
}
    await editWidget(iframe,page,widgetID);
    await editverify_Title(iframe,page,newPage,widgetID,newtitle);                 
});
// 3. Add Variable product from widget to cart
test('Add variable product from widget to cart', {tag:'@addVariable'},async () => {
    if(!widgetID){
        const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'CrossellPP.json'))); 
        widgetID = data.widgetID;
    }
    await NavigateToPage(newPage,pageName,storeURL,productOnstore);
    await Verify_variableToCart(newPage,widgetID,pageName,storeURL,'CrossSell');
});
// 4. Products to recommend
test.describe('Products to recommend',{tag:'@RecommendProducts'}, async()=>{
    test.beforeAll(async()=>{
        //widgetID = '0001';
        await NavigatetoApp(page,appName);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        if(!widgetID){
            const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'CrossellPP.json'))); 
            widgetID = data.widgetID;
            }
        await editWidget(iframe,page,widgetID);
        await ReloadandWait_Newpage(newPage)
        await WidgetIsDisplayed(newPage,widgetID);
    })
    test.beforeEach(async()=>{
        await iframe.getByRole('button', {name: /Manage bundles/}).click();
        await page.waitForTimeout(1000);
        await deleteCrossSell(iframe,page);    
    })
    test.afterAll(async()=>{
        await iframe.getByRole('button', {name: /Manage bundles/}).click();
        await page.waitForTimeout(1000);
        await deleteCrossSell(iframe,page);    
        await addSpecific(iframe,page,'All products',undefined,recom_Products);
        await Savewidget(iframe,page);
    })
    test('Cross-Sell for specific products', async()=>{

        await addSpecific(iframe,page,'Specific product',triggerProduct,recom_Products);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,Secondary_product);
        await WidgetNotDisplayed(newPage, widgetID);
        await NavigateToPage(newPage,pageName,storeURL,Main_product);
        await WidgetIsDisplayed(newPage, widgetID);
    });
    
    test.skip('Cross-Sell for specific collection', async()=>{
        await addSpecific(iframe,page,'Specific collection',triggerCollection,recom_Products);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,Main_product);
        await WidgetIsDisplayed(newPage, widgetID);
        await NavigateToPage(newPage,pageName,storeURL,Main_product);
        await WidgetNotDisplayed(newPage, widgetID);
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
            const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'CrossellPP.json'))); 
            widgetID = data.widgetID;
            }
        await editWidget(iframe,page,widgetID);
        await ReloadandWait_Newpage(newPage)
        newWidg = await WidgetIsDisplayed(newPage,widgetID);
    })
    test('Disable Discount',async()=>{
        await Discount(iframe,page,'disable');
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage);
        await verifyDiscountonStore(newWidg,'disable');
    })
    test('Enable discount',async()=>{
        await Discount(iframe,page,'enable',discount_cent);
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage);
        const totalPrice = await verifyDiscountonStore(newWidg,'enable',discount_cent);
        await discountAddedtoCart(newPage,pageName,storeURL,totalPrice);
    })
    test('Edit DiscountText', async()=>{
        await editverify_subtitle(page,newPage,iframe,newSubtitle,widgetID);
    })
});

// 6. Discount Combination
test.describe('Discount Combination',{tag:'@Discounts'}, async()=>{
    test.beforeAll(async()=>{
        //widgetID = '0082';
        await NavigatetoApp(page,appName);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        if(!widgetID){
            const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'CrossellPP.json'))); 
            widgetID = data.widgetID;
        }    
        await editWidget(iframe,page,widgetID);
        await Discount(iframe,page,'enable',discount_cent);
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage);
        newWidg = await WidgetIsDisplayed(newPage,widgetID);
        await verifyDiscountonStore(newWidg,'enable',discount_cent);    
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
        await verifyDiscountonStore(newWidg,'disable');  
        // Current date
        await scheduleDiscount(iframe,true);
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage);
        await verifyDiscountonStore(newWidg,'enable',discount_cent);  
    })
});
// 7. Customization
test.describe.only('Customize widget',{tag:'@Customization'},async()=>{
    test.beforeAll(async()=>{
        //widgetID = '0001';
        await NavigatetoApp(page,appName);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        if(!widgetID){
            const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'CrossellPP.json'))); 
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
    test('Dislay_Style(On Desktop) - Grid', async()=>{
        await desktop_displayStyle(iframe,page,newPage,widgetID,'grid');
    });
    test('Dislay_Style(On Desktop) - Popup', async()=>{
        await desktop_displayStyle(iframe,page,newPage,widgetID,'popup');
    });
    test('Dislay_Style(On Desktop) - List', async()=>{
        await desktop_displayStyle(iframe,page,newPage,widgetID,'list');
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
    test('Responsiveness of the preview section', async()=>{    
        await responsivePreview(iframe,page);
    });

});