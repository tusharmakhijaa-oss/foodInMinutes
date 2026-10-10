from django.contrib import admin
from menu.models import Category, Fooditem

# Register your models here.

class CategoryAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug': ('category_name',)}
    list_display = ('category_name', 'vendor', 'updated_at')
    search_fields = ('category_name', 'vendor__vendor_name')

class FooditemAdmin(admin.ModelAdmin):
    prepopulated_fields = {'slug': ('food_title',)}
    list_display = ('food_title','category_name', 'vendor', 'price', 'is_avaliable', 'updated_at')
    search_fields = ('food_title', 'category__category_name', 'vendor__vendor_name', 'price')
    list_filter = ('is_avaliable',)


admin.site.register(Category, CategoryAdmin)
admin.site.register(Fooditem, FooditemAdmin)
