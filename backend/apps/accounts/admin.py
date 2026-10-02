from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from django.db.models import Count
from .models import User, CustomerProfile, Address, EmailVerificationToken, PasswordResetToken


class CustomerProfileInline(admin.StackedInline):
    model = CustomerProfile
    can_delete = False
    verbose_name_plural = 'Profile'
    fields = ('phone', 'gender', 'date_of_birth', 'profile_image')
    extra = 0


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = (
        'email', 'full_name', 'is_active', 'is_email_verified',
        'is_staff', 'order_count', 'date_joined'
    )
    list_filter = ('is_active', 'is_staff', 'is_superuser', 'is_email_verified')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    readonly_fields = ('id', 'date_joined', 'last_login')
    inlines = [CustomerProfileInline]

    fieldsets = (
        (None, {'fields': ('id', 'email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name')}),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'is_email_verified', 'groups', 'user_permissions'),
            'classes': ('collapse',),
        }),
        ('Timestamps', {'fields': ('last_login', 'date_joined'), 'classes': ('collapse',)}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2'),
        }),
    )

    def full_name(self, obj):
        return obj.full_name
    full_name.short_description = 'Name'

    def order_count(self, obj):
        count = obj.orders.count()
        if count:
            return format_html(
                '<a href="/admin/orders/order/?user__id__exact={}">{} orders</a>',
                obj.pk, count
            )
        return '0 orders'
    order_count.short_description = 'Orders'

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('orders')


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'user', 'city', 'state', 'pincode', 'is_default')
    list_filter = ('state', 'is_default', 'country')
    search_fields = ('full_name', 'user__email', 'pincode', 'city')
    raw_id_fields = ('user',)
