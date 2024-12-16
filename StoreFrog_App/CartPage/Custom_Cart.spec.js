const {test } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const {
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
    RecentViewedProducts,
    Verify_variableToCart,

} = require('../testUtils/CommonFunctions');

// Functions for customisation
const {
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
} = require('../testUtils/visualPreference');

const {
    ApplySortbyFilter,
    RemovePreviousFilter_CustomWidget,
    ApplyDisplayFilter_CustomWidget,
    ViewDate_CustomWidget,
    UserRole_CustomWidget,
    Price_CustomWidget,
    CreateNewWidget,
    recommend_Date,
    recommendFilter,
    recommendPrice,
}= require('../testUtils/CustomWidgets');
const{
    userName, passWord, adminURL, adminTitle, appName,
    total_productsOn, products_perRow, edit_cartButton, edit_chooseButton,
    productOnstore,Main_product,Secondary_product,Category,Collection,Tag,price,
    priceAmount,pricePercentage,customRecent,
}= require('../testUtils/constants');
let context, iframe, widgetID, newPage, page, storeURL,pageURL;
const newtitle = 'Custom widget - Cart';
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
    pageURL = await newPage.url();
    await RecentViewedProducts(customRecent,newPage,storeURL,pageURL)
    await NavigateToPage(newPage,pageName,storeURL);
});

test.afterAll(async()=>{
    await context.close();
})

// 1. Create new Widget
test('Create new Custom widget (Onsale products) for Cart page', {tag:'@CreateNewWidget'},async()=>{
    fs.writeFileSync(path.resolve(__dirname, 'CustomCart.json'), JSON.stringify({}));
    await CreateNewWidget(page,iframe,appName,pageName,newtitle);
    widgetID = await FindWidgetID(iframe);
    fs.writeFileSync(path.resolve(__dirname, 'CustomCart.json'), JSON.stringify({ widgetID }));
    await ReloadandWait_Newpage(newPage)
    await WidgetIsDisplayed(newPage, widgetID);
});
// 2. Add Variable product from widget to cart
test('Add variable product from widget to cart',{tag:'@addVariable'}, async () => {
    if(!widgetID){
        const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'CustomCart.json'))); 
        widgetID = data.widgetID;
    }
    await ReloadandWait_Newpage(newPage)
    await Verify_variableToCart(newPage,widgetID,storeURL);
    await NavigateToPage(newPage,'Product page',storeURL,productOnstore);
    await addToCart(newPage);
    await NavigateToPage(newPage,pageName,storeURL);
});

/*
3. Products to recommend 
    i). Date (Last 24 hours, Last 7 days, Last 30 days, Last 6 months, Last year)
    ii). Category
    iii). Price(amount greaterThan/lessThan, percentage greaterThan/lessThan)
    iv). Collection
    v). Onsale 
    vi). Product tag
*/
test.describe('Products to Recommend',{tag:'@RecommendProducts'},()=>{
    test.beforeAll(async()=>{
        //widgetID='0078';
        await NavigatetoApp(page,appName);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        if(!widgetID){
            const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'CustomCart.json'))); 
            widgetID = data.widgetID;
            }
        await editWidget(iframe,page,widgetID);
        await ReloadandWait_Newpage(newPage)
        await WidgetIsDisplayed(newPage,widgetID);
    });

    test.beforeEach(async()=>{
        await RemovePreviousFilter_CustomWidget(iframe, 'Products to recommend');
    });
    
    test.afterAll(async()=>{
        // Selecting OnSale products as recommendation
        await RemovePreviousFilter_CustomWidget(iframe, 'Products to recommend');
        await iframe.locator('.sf-filter').first().click();
        await iframe.locator('.sf-filter-elements:has-text("On sale")').click();
        await Savewidget(iframe,page);
    })

    const DateFilter = [
        //'Last 24 hours',
        //'Last 7 days',
        //'Last 30 days',
        'Last 6 months',
        'Last year',
    ] // Commend datefilter with availbility
    for(const date of DateFilter){
        test(`Products to recommended - ${date}`, async()=>{
            await recommend_Date(iframe,page,newPage,widgetID,date);
        });
    }
    const recom = [
        'Category',
        'Collection',
        'Product tags'
    ]
    for(const recom_filt of recom){
        test(`Products to recommended - ${recom_filt}`, async()=>{
            await recommendFilter(page,iframe,newPage,widgetID,recom_filt)
        });
    }
    const SelectOptions =[
        'greaterThan',
        'lessThan',
    ]
    for (const amount_Value of SelectOptions){
        test(`Products to recommended - Price of the product ${amount_Value}`, async()=>{
            await recommendPrice(iframe,page,newPage,widgetID,amount_Value,'amount',priceAmount);
        });
        }
    for (const amount_Cent of SelectOptions){
        test(`Products to recommended - Price of the product ${amount_Cent} ${pricePercentage} % of currently viewing product`, async()=>{
            await recommendPrice(iframe,page,newPage,widgetID,amount_Cent,'percentage',pricePercentage);
        });
    }
});

/*
4. DisplayRules
    i). Category(Include/Exclude)
    ii). Product(Include/Exclude)
    iii). Collection(Include/Exclude)
    iv). Tag(Include/Exclude)
    v). User(Guest/Customer)
    vi). Price(GreaterThan/LessThan)
    vii). View Date(Current/Future)
*/
test.describe('Display Rules',{tag:'@DisplayRules'}, async()=>{
    test.beforeAll(async()=>{
        //widgetID = '0001';
        await NavigatetoApp(page,appName);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        if(!widgetID){
            const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'CustomCart.json'))); 
            widgetID = data.widgetID;
        }
        await editWidget(iframe,page,widgetID);
        await page.waitForTimeout(3000);
        await RemovePreviousFilter_CustomWidget(iframe, 'Display rules');
    });  
    test.afterEach(async()=>{
        await RemovePreviousFilter_CustomWidget(iframe, 'Display rules');
        await Savewidget(iframe,page);
    })

    test('Display Rules - Include Category', async()=>{
        await ApplyDisplayFilter_CustomWidget(iframe,'Category', 'Include', Category);
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage);
        await WidgetIsDisplayed(newPage,widgetID);
        await deleteFromCart(newPage);
        await NavigateToPage(newPage,'Product page',storeURL,Secondary_product);
        await addToCart(newPage);
        await NavigateToPage(newPage,pageName,storeURL);
        await WidgetNotDisplayed(newPage,widgetID);
        await deleteFromCart(newPage);
    });
    
    test('Display Rules - Exclude Category', async()=>{
        await ApplyDisplayFilter_CustomWidget(iframe,'Category', 'Exclude', Category);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,'Product page',storeURL,Secondary_product);
        await addToCart(newPage);
        await NavigateToPage(newPage,pageName,storeURL);
        await WidgetIsDisplayed(newPage,widgetID);
        await deleteFromCart(newPage);
        await NavigateToPage(newPage,'Product page',storeURL,Main_product);
        await addToCart(newPage);
        await NavigateToPage(newPage,pageName,storeURL);
        await WidgetNotDisplayed(newPage,widgetID);
        await deleteFromCart(newPage);
    });
    
    test('Display Rules - Include Product', async()=>{
        await ApplyDisplayFilter_CustomWidget(iframe,'Products', 'Include', Main_product);
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
    
    test('Display Rules - Exclude Product', async()=>{
        await ApplyDisplayFilter_CustomWidget(iframe, 'Products', 'Exclude', Main_product);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,'Product page',storeURL,Secondary_product);
        await addToCart(newPage);
        await NavigateToPage(newPage,pageName,storeURL);
        await WidgetIsDisplayed(newPage,widgetID);
        await deleteFromCart(newPage);
        await NavigateToPage(newPage,'Product page',storeURL,Main_product);
        await addToCart(newPage);
        await NavigateToPage(newPage,pageName,storeURL);
        await WidgetNotDisplayed(newPage,widgetID);
        await deleteFromCart(newPage);
    });
    
    test('Display Rules - Include Collection', async()=>{
        await ApplyDisplayFilter_CustomWidget(iframe, 'Collection', 'Include', Collection);
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
    
    test('Display Rules - Exclude Collection', async()=>{
        await ApplyDisplayFilter_CustomWidget(iframe,'Collection', 'Exclude', Collection);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,'Product page',storeURL,Secondary_product);
        await addToCart(newPage);
        await NavigateToPage(newPage,pageName,storeURL);
        await WidgetIsDisplayed(newPage,widgetID);
        await deleteFromCart(newPage);
        await NavigateToPage(newPage,'Product page',storeURL,Main_product);
        await addToCart(newPage);
        await NavigateToPage(newPage,pageName,storeURL);
        await WidgetNotDisplayed(newPage,widgetID);
        await deleteFromCart(newPage);
    });
    
    test('Display Rules - Include Tag', async()=>{
        await ApplyDisplayFilter_CustomWidget(iframe, 'Tag', 'Include', Tag);
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
    
    test('Display Rules - Exclude Tag', async()=>{
        await ApplyDisplayFilter_CustomWidget(iframe, 'Tag', 'Exclude', Tag);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,'Product page',storeURL,Secondary_product);
        await addToCart(newPage);
        await NavigateToPage(newPage,pageName,storeURL);
        await WidgetIsDisplayed(newPage,widgetID);
        await deleteFromCart(newPage);
        await NavigateToPage(newPage,'Product page',storeURL,Main_product);
        await addToCart(newPage);
        await NavigateToPage(newPage,pageName,storeURL);
        await WidgetNotDisplayed(newPage,widgetID);
        await deleteFromCart(newPage);
    });
    
    test('Display Rules - Guest User', async()=>{
        await UserRole_CustomWidget(iframe, 'User is guest');
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,'Product page',storeURL,Main_product);
        await addToCart(newPage);
        await NavigateToPage(newPage,pageName,storeURL);
        await WidgetIsDisplayed(newPage,widgetID);
    });
    
    test('Display Rules - Customer User', async()=>{
        await UserRole_CustomWidget(iframe, 'User is customer');
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage);
        await WidgetNotDisplayed(newPage,widgetID);
    });
    
    test('Display Rules - View Date (Current)', async()=>{
        await ViewDate_CustomWidget(iframe,true); //Current date
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage);
        await WidgetIsDisplayed(newPage,widgetID);
    });

    test('Display Rules - View Date (Future)', async()=>{
        await ViewDate_CustomWidget(iframe, false); //Future date
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage);
        await WidgetNotDisplayed(newPage,widgetID);
    });
    
    test('Display Rules - Price GreaterThan', async()=>{
        await Price_CustomWidget(iframe, 'greaterThan', price);
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
    
    test('Display Rules - Price LessThan', async()=>{
        await Price_CustomWidget(iframe, 'lessThan',price);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,'Product page',storeURL,Secondary_product);
        await addToCart(newPage);
        await NavigateToPage(newPage,pageName,storeURL);
        await WidgetIsDisplayed(newPage,widgetID);
        await deleteFromCart(newPage);
        await NavigateToPage(newPage,'Product page',storeURL,Main_product);
        await addToCart(newPage);
        await NavigateToPage(newPage,pageName,storeURL);
        await WidgetNotDisplayed(newPage,widgetID);
    });
});

/*
5. Customization
    i). Total Number of products on widget
    ii). Display style on desktop (Grid/Slider/List)
    iii). Title alignment(Left/Centre/Right)
    iv). Title font color
    v). Product price display
    vi). Product title alignment(Left/Centre/Right)
    vii). Product title font color
    viii). Cart button display
    ix). Button(AddtoCart & Select Option) texts
    x). Button Action (Redirect to cart/ Stay on page/ Redirect to checkout)
    xi). Button background color
    xii). Button Color
    xiii). Responsiveness
*/
test.describe('Customise widget',{tag:'@Customization'}, async()=>{
    test.beforeAll(async()=>{
        //widgetID = '0001';
        await NavigatetoApp(page,appName);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        if(!widgetID){
            const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'CustomCart.json'))); 
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
    test('The total number of products to display', async()=>{    
        await totalNumberOf_ProductonWidget(page,newPage,iframe,widgetID,total_productsOn);
    });
    
    test('Dislay_Style(On Desktop) - Grid', async()=>{    
        await desktop_displayStyle(iframe,page,newPage,widgetID,products_perRow,'grid');
    });

    test('Dislay_Style(On Desktop) - Slider', async()=>{    
        await desktop_displayStyle(iframe,page,newPage,widgetID,products_perRow,'slider');
    });

    test('Dislay_Style(On Desktop) - List', async()=>{    
        await desktop_displayStyle(iframe,page,newPage,widgetID,products_perRow,'List');
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
    
    test('Cart button display', async()=>{    
        await cartbuttonDisplay(iframe,page,newPage,widgetID,'disable');
        await page.waitForTimeout(2000);
        await cartbuttonDisplay(iframe,page,newPage,widgetID,'enable');
    })
    
    test('Cart button text (Add-to-cart & Select-option)', async()=>{    
        await cartbuttonText(iframe,page,newPage,widgetID,edit_cartButton,edit_chooseButton);
    });
    
    test('Cart button action - Redirect to Cart', async()=>{
        await cartbutton_Action(iframe,page,newPage,widgetID,'redirect to cart');
        await NavigateToPage(newPage,pageName,storeURL);

    });

    test('Cart button action - Stay on page', async()=>{
        await cartbutton_Action(iframe,page,newPage,widgetID,'stay on page');
    });
    
    test('Cart button action - Redirect to checkout', async()=>{
        await cartbutton_Action(iframe,page,newPage,widgetID,'redirect to checkout');
    });
    
    test('Cart button colors', async()=>{
        await cartbutton_Color(iframe,page,newPage,widgetID);
    });
    
    test('Responsiveness of the preview section', async()=>{    
        await responsivePreview(iframe,page);
    });
    
});

/*
6. Sort by
    i). Created date (Oldest to Newest/ Newest to Oldest)
    ii). Popularity ()Most to least popular/ Least to most popular)
    iii). Price ()High to low/ Low to high)
    iv). Random
*/
test.describe('Sort Products by',{tag:'@Sortby'},async()=>{
    test.beforeAll(async()=>{
        //widgetID='0078';
        await NavigatetoApp(page,appName);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        if(!widgetID){
            const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'CustomCart.json'))); 
            widgetID = data.widgetID;
        }
        await editWidget(iframe,page,widgetID);
        await ReloadandWait_Newpage(newPage)
        await WidgetIsDisplayed(newPage,widgetID);
        await RemovePreviousFilter_CustomWidget(iframe, 'Sort by');   
    });

    test.afterEach(async()=>{
        await RemovePreviousFilter_CustomWidget(iframe, 'Sort by');   
        await Savewidget(iframe,page);
    });

    test('Sort Products by Created date - Oldest to Newest', async()=>{
        await ApplySortbyFilter(iframe,'Created date','Oldest to newest');
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage);
        await WidgetIsDisplayed(newPage,widgetID);
    });
    test('Sort Products by Created date - Newest to Oldest',async()=>{
        await ApplySortbyFilter(iframe,'Created date','Newest to oldest');
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage);
        await WidgetIsDisplayed(newPage,widgetID);
    });
    test('Sort Products by Popularity - Most to least popular',async()=>{
        await ApplySortbyFilter(iframe,'Popularity','Most to least popular');
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage);
        await WidgetIsDisplayed(newPage,widgetID);
    });
    test('Sort Products by Popularity - Least to most popular',async()=>{
        await ApplySortbyFilter(iframe,'Popularity','Least to most popular');
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage);
        await WidgetIsDisplayed(newPage,widgetID);
    });
    test('Sort Products by Price - High to low',async()=>{
        await ApplySortbyFilter(iframe,'Price','High to low');
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage);
        await WidgetIsDisplayed(newPage,widgetID);
    });
    test('Sort Products by Price - Low to High',async()=>{
        await ApplySortbyFilter(iframe,'Price','Low to high');
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage);
        await WidgetIsDisplayed(newPage,widgetID);

    });
    test('Sort Products by Randomize',async()=>{
        await ApplySortbyFilter(iframe,'Randomize');
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage);
        await WidgetIsDisplayed(newPage,widgetID);

    });
});
