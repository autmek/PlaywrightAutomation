const {test,expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
// Common functions used
const {
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
    editverify_Title,
    NavigateToPage,
    Verify_variableToCart,
    recomProductsOnWidget,
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
const{
    userName, passWord, adminURL, adminTitle, appName,
    total_productsOn, products_perRow, edit_cartButton, edit_chooseButton,
    productOnstore,Main_product,Secondary_product,Category,Collection,Tag,price,
    recentViewed_products,
    triggerCollection,
}= require('../testUtils/constants');
const {
    deleteCrossSell,
} = require('../testUtils/CrossSell');

let context, iframe, widgetID, newPage, page, storeURL;

const newtitle = 'Updated Related Products - PP';
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
test('Create new Related product widget for Product page',{tag:'@CreateNewWidget'}, async()=>{
    fs.writeFileSync(path.resolve(__dirname, 'RelatedPP.json'), JSON.stringify({}));
    await page.waitForLoadState('load');
    await CreateNewWidget(page, iframe, appName,pageName, 'Related products');
    widgetID = await FindWidgetID(iframe);
    fs.writeFileSync(path.resolve(__dirname, 'RelatedPP.json'), JSON.stringify({ widgetID }));
    await ReloadandWait_Newpage(newPage)
    await WidgetIsDisplayed(newPage, widgetID);
});

// 2. Edit widget title
test('Edit Widget title',{tag:'@EditTitle'}, async ()=> {
    //widgetID = '0056';
    await NavigatetoApp(page,appName);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    if(!widgetID){
        const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'RelatedPP.json'))); 
        widgetID = data.widgetID;
    }
    await editWidget(iframe,page,widgetID);
    await editverify_Title(iframe,page,newPage,widgetID,newtitle);                 
});

/*
3. Products to recommend 
    i). Automatic recommendation
    ii). Collection of currently viewing product
    iii). Type of currently viewing product
    iv). Vendor of currently viewing product
    v). Category of currently viewing product
    vi). Tag of currently viewing product
    vii). Manual Recommendation
*/
test.describe('Products to Recommend',{tag:'@RecommendProducts'},()=>{
    test.beforeAll(async()=>{
        //widgetID = '0001';
        await NavigatetoApp(page,appName);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        if(!widgetID){
            const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'RelatedPP.json'))); 
            widgetID = data.widgetID;
            }
        await editWidget(iframe,page,widgetID);
        await ReloadandWait_Newpage(newPage)
        await WidgetIsDisplayed(newPage,widgetID);
    });
    test(`Manual Recommendation - Specific product`,async()=>{
        await iframe.getByText('Manual recommendation').click();
        await iframe.getByRole('button',{name:/Manage bundles/}).click();
        await deleteCrossSell(iframe,page);
        await manualRecommendation('Specific product',productOnstore);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,Main_product);
        await recomProductsOnWidget(newPage,widgetID,recentViewed_products);
        await NavigateToPage(newPage,pageName,storeURL,Secondary_product);
        await WidgetNotDisplayed(newPage,widgetID);
    });
    test.skip(`Manual Recommendation - Specific collection`,async()=>{
        await iframe.getByText('Manual recommendation').click();
        await iframe.getByRole('button',{name:/Manage bundles/}).click();
        await deleteCrossSell(iframe,page);
        await manualRecommendation('Specific collection',triggerCollection);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,Main_product);
        await recomProductsOnWidget(newPage,widgetID,recentViewed_products);
        await NavigateToPage(newPage,pageName,storeURL,Secondary_product);
        await WidgetNotDisplayed(newPage,widgetID);
    });
    const filterType = [
        'Collection of currently viewing product',
        'Type of currently viewing product',
        'Vendor of currently viewing product',
        'Category of currently viewing product',
        'Tag of currently viewing product',
    ];
    for (const type of filterType) {
        test(`Products to recommend - ${type}`, async ()=> {
            await iframe.getByText('Set filters').click();
            await page.waitForTimeout(3000);        
            const allCheckedOptions = iframe.locator('.Polaris-Checkbox--checked');
            const checkedCount = await allCheckedOptions.count();
            if (checkedCount > 0) {
                await allCheckedOptions.click({ force: true });
            }
            // Select the current filter type
            await iframe.getByLabel(type).click();
            await Savewidget(iframe,page);
            await ReloadandWait_Newpage(newPage);
            await WidgetIsDisplayed(newPage,widgetID);
        });
    }
    test('Products to recommends - Automatic', async ()=> {
        await iframe.getByText('Automatic').click();
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage)
        await WidgetIsDisplayed(newPage,widgetID);
    });

});
async function manualRecommendation(triggerOption,triggerValue){
    await page.waitForTimeout(1000);
    const Recom_Modal = await iframe.locator('.Polaris-Modal-Section');
    const addBundle = await iframe.getByRole('button',{name: 'Add new bundle'});
    if(!await Recom_Modal.isVisible()){
        await addBundle.first().click();
    }
    await Recom_Modal.getByText(triggerOption).click();
    await iframe.getByRole('button',{name:"Next"}).click();
    await Recom_Modal.locator('.Polaris-TextField__Input').fill(triggerValue);
    await page.waitForTimeout(500);
    await Recom_Modal.getByLabel(triggerValue).locator('.Polaris-Checkbox').click();
    await page.waitForTimeout(1000);
    await iframe.getByRole('button',{name:"Next"}).click();
    for(const Recommendation of recentViewed_products){
        await iframe.locator('.Polaris-TextField__Input').fill(Recommendation);
        await page.waitForTimeout(1000);
        await iframe.getByLabel(Recommendation).locator('.Polaris-Checkbox').click();
        await page.waitForTimeout(1000);
    }
    await iframe.locator('.sf-cs-modal-footer').getByRole('button',{name:'Confirm'}).click();
    await iframe.getByRole('button',{name: 'Continue'}).click();
}

async function recomProductsOnWidget(){
    const newWidg = await WidgetIsDisplayed(newPage,widgetID);
    const productTitles = await newWidg.locator('.sf-product-title').allTextContents();
    for(const recom of recentViewed_products){
        expect(productTitles).toContain(recom);
    }
}

// 4. Add Variable product from widget to cart
test('Add variable product from widget to cart', async () => {
    if(!widgetID){
        const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'RelatedPP.json'))); 
        widgetID = data.widgetID;
    }
    await NavigateToPage(newPage,pageName,storeURL,productOnstore);
    await Verify_variableToCart(newPage,widgetID,storeURL);
});

/*
5. DisplayRules
    i). Category(Include/Exclude)
    ii). Product(Include/Exclude)
    iii). Collection(Include/Exclude)
    iv). Tag(Include/Exclude)
    v). User(Guest/Customer)
    vi). Price(GreaterThan/LessThan)
    vii). View Date(Current/Future)
*/
test.describe('Display Rules', {tag:'@DisplayRules'}, async()=>{

    test.beforeAll(async()=>{
        //widgetID = '0001';
        await NavigatetoApp(page,appName);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        if(!widgetID){
            const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'RelatedPP.json'))); 
            widgetID = data.widgetID;
            }
        await editWidget(iframe,page,widgetID);
        await page.waitForTimeout(3000);
        await RemovePreviousDisplayFilter(iframe);
    });  

    test.afterEach(async()=>{
        await RemovePreviousDisplayFilter(iframe);
        await Savewidget(iframe,page);
    })

    test('Display Rules - Include Category', async()=>{
        await ApplyDisplayFilter(iframe,'Category', 'Include', Category);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,Main_product);
        await WidgetIsDisplayed(newPage,widgetID);
        await NavigateToPage(newPage,pageName,storeURL,Secondary_product);
        await WidgetNotDisplayed(newPage,widgetID);
    });
    
    test('Display Rules - Exclude Category', async()=>{
        await ApplyDisplayFilter(iframe,'Category', 'Exclude', Category);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,Secondary_product);
        await WidgetIsDisplayed(newPage,widgetID);
        await NavigateToPage(newPage,pageName,storeURL,Main_product);
        await WidgetNotDisplayed(newPage,widgetID);
    });
    
    test('Display Rules - Include Product', async()=>{
        await ApplyDisplayFilter(iframe,'Products', 'Include', Main_product);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,Main_product);
        await WidgetIsDisplayed(newPage,widgetID);
        await NavigateToPage(newPage,pageName,storeURL,Secondary_product);
        await WidgetNotDisplayed(newPage,widgetID);
    });
    
    test('Display Rules - Exclude Product', async()=>{
        await ApplyDisplayFilter(iframe, 'Products', 'Exclude', Main_product);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,Secondary_product);
        await WidgetIsDisplayed(newPage,widgetID);
        await NavigateToPage(newPage,pageName,storeURL,Main_product);
        await WidgetNotDisplayed(newPage,widgetID);
    });
    
    test('Display Rules - Include Collection', async()=>{
        await ApplyDisplayFilter(iframe, 'Collection', 'Include', Collection);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,Main_product);
        await WidgetIsDisplayed(newPage,widgetID);
        await NavigateToPage(newPage,pageName,storeURL,Secondary_product);
        await WidgetNotDisplayed(newPage,widgetID);

    });
    
    test('Display Rules - Exclude Collection', async()=>{
        await ApplyDisplayFilter(iframe,'Collection', 'Exclude', Collection);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,Secondary_product);
        await WidgetIsDisplayed(newPage,widgetID);
        await NavigateToPage(newPage,pageName,storeURL,Main_product);
        await WidgetNotDisplayed(newPage,widgetID);
    });
    
    test('Display Rules - Include Tag', async()=>{
        await ApplyDisplayFilter(iframe, 'Tag', 'Include', Tag);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,Main_product);
        await WidgetIsDisplayed(newPage,widgetID);
        await NavigateToPage(newPage,pageName,storeURL,Secondary_product);
        await WidgetNotDisplayed(newPage,widgetID);
    });
    
    test('Display Rules - Exclude Tag', async()=>{
        await ApplyDisplayFilter(iframe, 'Tag', 'Exclude', Tag);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,Secondary_product);
        await WidgetIsDisplayed(newPage,widgetID);
        await NavigateToPage(newPage,pageName,storeURL,Main_product);
        await WidgetNotDisplayed(newPage,widgetID);
    });
    
    test('Display Rules - Guest User', async()=>{
        await UserRole(iframe, 'User is guest');
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,Main_product);
        await ReloadandWait_Newpage(newPage);
        await WidgetIsDisplayed(newPage,widgetID);
    });
    
    test('Display Rules - Customer User', async()=>{
        await UserRole(iframe, 'User is customer');
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,Main_product);
        await ReloadandWait_Newpage(newPage);
        await WidgetNotDisplayed(newPage,widgetID);
    });
    
    test('Display Rules - View Date (Current)', async()=>{
        await ViewDate(iframe,true); //Current date
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage);
        await WidgetIsDisplayed(newPage,widgetID);
    });

    test('Display Rules - View Date (Future)', async()=>{
        await ViewDate(iframe, false); //Future date
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage);
        await WidgetNotDisplayed(newPage,widgetID);
    });
    
    test('Display Rules - Price GreaterThan', async()=>{
        await Price(iframe, 'greaterThan', price);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,Main_product);
        await WidgetIsDisplayed(newPage,widgetID);
        await NavigateToPage(newPage,pageName,storeURL,Secondary_product);
        await WidgetNotDisplayed(newPage,widgetID);
    });
    
    test('Display Rules - Price LessThan', async()=>{
        await Price(iframe, 'lessThan',price);
        await Savewidget(iframe,page);
        await NavigateToPage(newPage,pageName,storeURL,Main_product);
        await WidgetNotDisplayed(newPage,widgetID);
        await NavigateToPage(newPage,pageName,storeURL,Secondary_product);
        await WidgetIsDisplayed(newPage,widgetID);
    });
    
});

/*
6. Customization
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
            const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'RelatedPP.json'))); 
            widgetID = data.widgetID;
            }
        await editWidget(iframe,page,widgetID);
        await NavigateToPage(newPage,pageName,storeURL,productOnstore);
        await WidgetIsDisplayed(newPage,widgetID);

        await iframe.locator(`.sf-settings-btn`).nth(1).scrollIntoViewIfNeeded(); //Just to see the area properly
        await iframe.locator('.widget-settings-button').click(); //Customize
        await page.waitForTimeout(3000);
    }); 
    test.afterAll(async()=>{
        //Closing customize window
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

