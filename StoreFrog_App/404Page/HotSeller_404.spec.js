const {test } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
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
    UserRole, 
    NavigateToPage,
    editverify_Title,
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
const{
    userName, passWord, adminURL, adminTitle, appName,
    total_productsOn, products_perRow, edit_cartButton, edit_chooseButton,
}= require('../testUtils/constants');

let context, iframe, widgetID, newPage, page, storeURL;

// Constants
const newtitle = 'NEW HotSeller - 404';
const pageName = '404 page';

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
    await NavigateToPage(newPage,pageName,storeURL);
});

test.afterAll(async()=>{
    await context.close();
})

// 1. Create new Widget
test('Create new HotSeller widget for 404 page',{tag:'@CreateNewWidget'}, async()=>{
    fs.writeFileSync(path.resolve(__dirname, 'Hotseller404.json'), JSON.stringify({}));
    await page.waitForLoadState('load');
    await CreateNewWidget(page, iframe, appName,pageName, 'Hot selling');
    widgetID = await FindWidgetID(iframe);
    fs.writeFileSync(path.resolve(__dirname, 'Hotseller404.json'), JSON.stringify({ widgetID }));
    await ReloadandWait_Newpage(newPage)
    await WidgetIsDisplayed(newPage, widgetID);
});

// 2. Edit widget title
test('Edit Widget title',{tag:'@EditTitle'}, async ()=> {
    //widgetID = '0106';
    await NavigatetoApp(page,appName);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    if(!widgetID){
        const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'Hotseller404.json'))); 
        widgetID = data.widgetID;
    }
    await editWidget(iframe,page,widgetID);
    await editverify_Title(iframe,page,newPage,widgetID,newtitle);
});
// 3. Add Variable product from widget to cart
test('Add variable product from widget to cart',{tag:'@addVariable'}, async () => {
    if(!widgetID){
        const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'Hotseller404.json'))); 
        widgetID = data.widgetID;
    }
    await NavigateToPage(newPage,pageName,storeURL);
    await Verify_variableToCart(newPage,widgetID,storeURL);
});

/*
4. DisplayRules
    i). User(Guest/Customer)
*/
test.describe('Display Rules',{tag:'@DisplayRules'}, async()=>{
    test.beforeAll(async()=>{
        //widgetID = '0001';
        await NavigatetoApp(page,appName);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        if(!widgetID){
            const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'Hotseller404.json'))); 
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
    test('Display Rules - Guest User', async()=>{
        await UserRole(iframe, 'User is guest');
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage);
        await WidgetIsDisplayed(newPage,widgetID);
    });
    test('Display Rules - Customer User', async()=>{
        await UserRole(iframe, 'User is customer');
        await Savewidget(iframe,page);
        await ReloadandWait_Newpage(newPage);
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
            const data= JSON.parse(fs.readFileSync(path.resolve(__dirname, 'Hotseller404.json'))); 
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
