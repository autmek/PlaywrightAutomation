// Common Constants
const userName = 'aleesha@mozilor.com';
const passWord = 'SL5bQxhwPC5AYJ$'
const adminURL = 'https://sf-automationstore.myshopify.com/admin';
const adminTitle = 'sf-automationstore · Home · Shopify'; // To confirm admin login
const appName = 'SF Product Recommendations'; //Live appName
//const appName = 'Storefrog Recommendations '; //Staging appName

//Recent viewed products also used for manual recommendation of related products on product page
const recentViewed_products = [
    'Black Beanbag',
    'Anchor Bracelet',
    'Antique Drawers',
    'Brown Throw Pillows',
    'Copper Light',
    'Clay Plant Pot',
    'Pink Armchair',
    '7 Shakra Bracelet',
];


//Customization
const total_productsOn = '5'; //[5-20]
const products_perRow = '4'; //[3-8]
const edit_cartButton = 'New Cart'; 
const edit_chooseButton = 'New Choose';

// CollectionPage
const CollectionPage = 'Automated Collection';
const MainCollection = CollectionPage;
const secondaryCollection = 'Home page';

// ProductPage/CartPage DisplayRules
const productOnstore = 'Cream Sofa';
const Main_product = productOnstore;
const Secondary_product = 'Black Beanbag';
const Category = 'Sofa Tables';
const Collection = 'Automated Collection';
const Tag = 'Wood';
const price = '80';

// Recommendation for ShopPage
const Type = 'Indoor';
const Vendor = 'Company 123'; 
//CustomWidgetRecommendation
const priceAmount = '10';
const pricePercentage = '50';
const customRecent = [
    '7 Shakra Bracelet',
    'Cream Sofa',
]

// Constants4FBT
const total_productsOnFBT = '4'; //[1-5]
const edit_singleCartButton = 'Buy this'; 
const edit_bothCartButton = 'Buy both';
const edit_allCartButton = 'Buy All';
const edit_discountText = 'Buy and Get discount';
// Constants for Product Recommendations
const triggerProduct = productOnstore;
const recom_Products = [
    '7 Shakra Bracelet',
    'Anchor Bracelet',
    'Antique Drawers',
];
// Discounts
const discount_flat = '10';
const discount_cent = '50';

//CrossSell&Upsell
const triggerCollection = CollectionPage;
const newSubtitle = 'Updated discount';
const productCoupon = 'productCombo';
const couponComboProduct = 'Brown Throw Pillows';
const orderCoupon = 'orderCombo';
const shippingCoupon = 'shippingCombo';
const postCode = 'GU10 4LU';

//UpSell
const triggerVariant = 'Anchor Bracelet';
const higherPricedVariant = 'Gold';
const secondaryVariant = '7 Shakra Bracelet';
module.exports = {
    userName, passWord, adminURL, adminTitle, appName,
    recentViewed_products, 
    total_productsOn, products_perRow, edit_cartButton, edit_chooseButton,
    CollectionPage,MainCollection,secondaryCollection,
    productOnstore,Main_product,Secondary_product,Category,Collection,Tag,price,
    priceAmount,pricePercentage,customRecent,
    total_productsOnFBT,edit_singleCartButton,edit_bothCartButton,edit_allCartButton,
    edit_discountText,triggerProduct,recom_Products,discount_flat,discount_cent,
    triggerCollection,productCoupon,orderCoupon,shippingCoupon,newSubtitle,
    triggerVariant,secondaryVariant,higherPricedVariant,
    Type,Vendor,couponComboProduct,postCode,
}