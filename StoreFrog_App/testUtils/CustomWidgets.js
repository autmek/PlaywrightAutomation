const { expect } = require('@playwright/test');
const{
    Savewidget,
    ReloadandWait_Newpage,
    WidgetIsDisplayed,
    NavigatetoApp,

} = require('./CommonFunctions');

async function ApplySortbyFilter(iframe,type,order){
    await iframe.locator(`.sf-settings-btn`).nth(1).scrollIntoViewIfNeeded(); //Just to see the area properly
    const sort_Card = await iframe.locator('.sf-filter-button-container').nth(2);
    await sort_Card.locator('.sf-filter').click();
    await iframe.locator(`.sf-filter-elements:has-text("${type}")`).click(); //filter type
    switch(order){
        case 'Oldest to newest':
        case 'Most to least popular':
        case 'High to low':
            await iframe.locator('.Polaris-RadioButton').first().click();
            break;
        case 'Newest to oldest':
        case 'Least to most popular':
        case 'Low to high':
            await iframe.locator('.Polaris-RadioButton').nth(1).click();
            break;
        
    }

}

async function RemovePreviousFilter_CustomWidget(iframe, filter_function){
    const products_Card = await iframe.locator('.sf-filter-button-container').first();
    const display_Card = await iframe.locator('.sf-filter-button-container').nth(1);
    const sort_Card = await iframe.locator('.sf-filter-button-container').nth(2);
    
    const product_previousOption = await products_Card.locator('.Polaris-Icon__Svg');
    const display_previousOption = await display_Card.locator('.Polaris-Icon__Svg');
    const sort_previousOption = await sort_Card.locator('.Polaris-Icon__Svg');

    switch(filter_function){
        case 'Products to recommend':
            if (await product_previousOption.count() > 1){
                await product_previousOption.first().click();
            }
            break;
        case 'Display rules':
            if (await display_previousOption.count() > 1){
                await display_previousOption.first().click();
            }
            break;
        case 'Sort by':
            if (await sort_previousOption.count() > 1){
                await sort_previousOption.first().click();
            }
            break;
    }
}
async function ApplyDisplayFilter_CustomWidget(iframe, type, action, value){
    const display_Card = await iframe.locator('.sf-filter-button-container').nth(1);

    await display_Card.getByText('Add filter').click(); //Add filter
    await iframe.locator(`.sf-filter-elements:has-text("${type}")`).click(); //filter type

    await iframe.locator(`.sf-settings-btn`).nth(1).scrollIntoViewIfNeeded(); //Just to see the area properly
    await iframe.getByText(action).click(); //Include/ Exclude
    await iframe.locator(`input[role="combobox"]`).fill(value);
    await iframe.getByRole('option', { name: value, exact: true }).click();

}

async function ViewDate_CustomWidget(iframe, ActiveWindow){
    const display_Card = await iframe.locator('.sf-filter-button-container').nth(1);

	await display_Card.getByText('Add filter').click();
	await iframe.getByText(`Viewing date`).click(); 
	if (!ActiveWindow){
	    const today = new Date();
	    const tomorrow = new Date(today);
	    tomorrow.setDate(today.getDate() + 1);
	    const tomorrow_monthName = tomorrow.toLocaleDateString('en-US', { month: 'long' });
        const today_monthName = today.toLocaleDateString('en-US', { month: 'long' });
        const day = tomorrow.getDate();
        await iframe.locator(`.sf-settings-btn`).nth(1).scrollIntoViewIfNeeded(); //Just to see the area properly
        await iframe.locator('.sf-datepicker-mT .Polaris-Box').first().click();
        if(tomorrow_monthName!==today_monthName){
            await iframe.locator('.Polaris-DatePicker__Header .Polaris-Button__Icon').nth(1).click();
        }
        await iframe.locator('.Polaris-DatePicker__Day').nth(day-1).click();  
    }
}

async function UserRole_CustomWidget(iframe, userRole)
{
    const display_Card = await iframe.locator('.sf-filter-button-container').nth(1);

    await display_Card.getByText('Add filter').click();
    await iframe.getByText(`User role`).click();
    await iframe.getByText(userRole).click();
}
async function Price_CustomWidget(iframe, optionValue,price){
    const display_Card = await iframe.locator('.sf-filter-button-container').nth(1);

    await display_Card.getByText('Add filter').click(); 
    await iframe.getByText(`Price`).click();
    await iframe.locator('select.Polaris-Select__Input').selectOption(optionValue);   
    await iframe.locator('input[type="number"]').fill(price);
}

async function CreateNewWidget(page,iframe,appName,pageName,newtitle){
    await page.waitForLoadState('load');
    await NavigatetoApp(page,appName);
    await iframe.getByRole('button', { name: 'Create new recommendation' }).click();
    await iframe.getByText(pageName).click();
    await page.waitForTimeout(1000);
    await iframe.locator('.sf-widget-card').last().scrollIntoViewIfNeeded();
    await iframe.getByText('Custom widget').click({force:true});
    //Add widget name 
    await iframe.locator('.Polaris-TextField__Input').fill(newtitle);
    //Selecting Onsale products to recommend
    await iframe.locator('.sf-filter-display:has-text("Products to be recommended")').click();
    await iframe.locator('.sf-filter').first().click();
    await iframe.locator('.sf-filter-elements:has-text("On sale")').click();
    await iframe.locator('.sf-widget-button').click();
    // Click on the OK button in 'Widget created' modal
    const modal = await iframe.locator('.Polaris-Modal-Dialog');
    await expect(modal).toBeVisible();
    await iframe.getByRole('button', { name: 'Okay' }).click();
    console.log(`✅ ${pageName} - CustomWidget is created`);


}

async function recommend_Date(iframe,page,newPage,widgetID,date){
    await page.waitForTimeout(1000);
    await iframe.locator('.sf-filter').first().click();
    await iframe.locator('.sf-filter-elements:has-text("Date")').click();
    await iframe.locator(`.Polaris-Choice__Label:has-text("${date}")`).click();
    await Savewidget(iframe,page);
    await ReloadandWait_Newpage(newPage);
    await WidgetIsDisplayed(newPage,widgetID);
}

async function recommendFilter(page,iframe,newPage,widgetID,recom_filt){
    await page.waitForTimeout(1000);
    await iframe.locator('.sf-filter').first().click();
    await iframe.locator(`.sf-filter-elements:has-text("${recom_filt}")`).click();
    await Savewidget(iframe,page);
    await ReloadandWait_Newpage(newPage);
    await WidgetIsDisplayed(newPage, widgetID);
}

async function recommendPrice(iframe,page,newPage,widgetID,amount,priceCase,price){
    await iframe.locator('.sf-filter').first().click();
    await iframe.locator(`.sf-filter-elements:has-text("Price")`).click();
    await iframe.locator('.sf-active-btn').click();
    switch(priceCase.toLowerCase()){
        case 'amount':
            await iframe.locator('.Polaris-RadioButton').first().click();
            const Price_Amount = await iframe.locator('select.Polaris-Select__Input').first();
            await Price_Amount.selectOption(amount);
            await iframe.locator('input[type="number"]').first().fill(price);
            break;
        case 'percentage':
            await iframe.locator('.Polaris-RadioButton').nth(1).click();
            const Price_cent = await iframe.locator('select.Polaris-Select__Input').nth(1);
            await Price_cent.selectOption(amount);
            await iframe.locator('input[type="number"]').nth(1).fill(price); 
            break;
    }
    await Savewidget(iframe,page);
    await ReloadandWait_Newpage(newPage);
    await WidgetIsDisplayed(newPage, widgetID);

}
module.exports = { 
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
}