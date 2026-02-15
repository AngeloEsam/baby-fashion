export const translations = {
  ar: {
    // Navbar
    home: 'الرئيسية',
    products: 'المنتجات',
    contact: 'اتصل بنا',
    cart: 'السلة',
    darkMode: 'الوضع الداكن',
    lightMode: 'الوضع الفاتح',
    language: 'English',

    // Hero
    welcome: 'أهلا بكم في',
    shopName: 'بيبي فيشن',
    heroSubtitle: 'أحدث ملابس الأطفال بأفضل الأسعار',
    shopNow: 'تسوق الآن',

    // Products
    allProducts: 'جميع المنتجات',
    addToCart: 'إضافة للسلة',
    sizes: 'المقاس',
    selectSize: 'اختر المقاس',
    sale: 'خصم',
    outOfStock: 'غير متوفر',
    price: 'السعر',
    originalPrice: 'السعر الأصلي',

    // Cart
    yourCart: 'سلة المشتريات',
    emptyCart: 'السلة فارغة',
    continueShopping: 'متابعة التسوق',
    total: 'الإجمالي',
    checkout: 'إتمام الطلب',
    quantity: 'الكمية',
    remove: 'حذف',

    // Order Form
    orderDetails: 'بيانات الطلب',
    fullName: 'الاسم الكامل',
    phoneNumber: 'رقم التليفون',
    address: 'العنوان',
    orderNotes: 'ملاحظات (اختياري)',
    placeOrder: 'تأكيد الطلب',
    orderSuccess: 'تم إرسال طلبك بنجاح!',
    orderSuccessMessage: 'سيتم التواصل معك قريباً لتأكيد الطلب',

    // Admin
    admin: 'لوحة التحكم',
    orders: 'الطلبات',
    noOrders: 'لا توجد طلبات',
    orderNumber: 'رقم الطلب',
    orderDate: 'تاريخ الطلب',
    customerName: 'اسم العميل',
    customerPhone: 'تليفون العميل',
    customerLocation: 'عنوان العميل',
    orderItems: 'المنتجات',
    orderTotal: 'إجمالي الطلب',
    orderStatus: 'حالة الطلب',
    pending: 'قيد الانتظار',
    confirmed: 'تم التأكيد',
    delivered: 'تم التسليم',
    cancelled: 'ملغي',
    markConfirmed: 'تأكيد',
    markDelivered: 'تسليم',
    markCancelled: 'إلغاء',
    whatsapp: 'تواصل واتساب',

    // Footer
    footerTitle: 'بيبي فيشن',
    footerDesc: 'أفضل ملابس أطفال بأفضل الأسعار وجودة عالية',
    quickLinks: 'روابط سريعة',
    followUs: 'تابعنا',
    copyright: 'جميع الحقوق محفوظة',

    // Categories
    dresses: 'فساتين',
    suits: 'بدلات',
    tshirts: 'تيشيرتات',
    jackets: 'جاكيتات',
    pants: 'بناطيل',
    all: 'الكل',
    backToProducts: 'العودة للمنتجات',
  },
  en: {
    // Navbar
    home: 'Home',
    products: 'Products',
    contact: 'Contact',
    cart: 'Cart',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    language: 'العربية',

    // Hero
    welcome: 'Welcome to',
    shopName: 'Baby Vision',
    heroSubtitle: 'Latest kids clothing at the best prices',
    shopNow: 'Shop Now',

    // Products
    allProducts: 'All Products',
    addToCart: 'Add to Cart',
    sizes: 'Size',
    selectSize: 'Select Size',
    sale: 'Sale',
    outOfStock: 'Out of Stock',
    price: 'Price',
    originalPrice: 'Original Price',

    // Cart
    yourCart: 'Your Cart',
    emptyCart: 'Cart is empty',
    continueShopping: 'Continue Shopping',
    total: 'Total',
    checkout: 'Checkout',
    quantity: 'Quantity',
    remove: 'Remove',

    // Order Form
    orderDetails: 'Order Details',
    fullName: 'Full Name',
    phoneNumber: 'Phone Number',
    address: 'Address',
    orderNotes: 'Notes (optional)',
    placeOrder: 'Place Order',
    orderSuccess: 'Order placed successfully!',
    orderSuccessMessage: 'We will contact you soon to confirm your order',

    // Admin
    admin: 'Dashboard',
    orders: 'Orders',
    noOrders: 'No orders yet',
    orderNumber: 'Order #',
    orderDate: 'Date',
    customerName: 'Customer Name',
    customerPhone: 'Phone',
    customerLocation: 'Location',
    orderItems: 'Items',
    orderTotal: 'Total',
    orderStatus: 'Status',
    pending: 'Pending',
    confirmed: 'Confirmed',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    markConfirmed: 'Confirm',
    markDelivered: 'Deliver',
    markCancelled: 'Cancel',
    whatsapp: 'WhatsApp',

    // Footer
    footerTitle: 'Baby Vision',
    footerDesc: 'Best kids clothing at best prices and high quality',
    quickLinks: 'Quick Links',
    followUs: 'Follow Us',
    copyright: 'All rights reserved',

    // Categories
    dresses: 'Dresses',
    suits: 'Suits',
    tshirts: 'T-Shirts',
    jackets: 'Jackets',
    pants: 'Pants',
    all: 'All',
    backToProducts: 'Back to Products',
  },
};

export type TranslationKey = keyof typeof translations.ar;
