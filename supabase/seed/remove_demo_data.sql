-- يحذف كل البيانات التجريبية (المطاعم والصور والمراجعات والمفضلة المرتبطة بها). شغّله قبل الإطلاق.
delete from public.restaurants where is_demo = true;
