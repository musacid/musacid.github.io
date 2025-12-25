# musacid.me (Static store)
هذا مشروع موقع ثابت (GitHub Pages) لعرض وبيع منتجات رقمية. الدفع وتسليم الملفات يتم عبر Gumroad.

## تشغيل محليًا
افتح index.html مباشرة أو استخدم أي سيرفر بسيط.

## النشر على GitHub Pages مع الدومين
- ارفع الملفات كما هي إلى مستودع GitHub.
- فعّل GitHub Pages من Settings > Pages.
- ملف CNAME موجود ويحتوي musacid.me.
- في Namecheap: أضف DNS:
  - A Record إلى IPs الخاصة بـ GitHub Pages
  - أو CNAME إلى <username>.github.io (حسب إعدادك)

## الدفع
حاليًا كل المنتجات تستخدم نفس رابط Gumroad:
https://musacid.gumroad.com/l/bdotqz

لو أنشأت روابط منفصلة لكل منتج على Gumroad، حدّث حقل checkout_url داخل products.json لكل منتج.
