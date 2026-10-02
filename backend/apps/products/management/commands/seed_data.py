"""
AURA Cosmetics — Demo Seed Data
Run: python manage.py seed_data

Populates the database with realistic demo data for development/presentation.
"""
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from decimal import Decimal


class Command(BaseCommand):
    help = 'Seeds the database with AURA demo data (categories, brands, products, coupons)'

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING('\n🌸  AURA — Seeding demo data…\n'))
        self._seed_categories()
        self._seed_concerns()
        self._seed_brands()
        self._seed_products()
        self._seed_coupons()
        self._seed_homepage_banners()
        self.stdout.write(self.style.SUCCESS('\n✅  Seed complete!\n'))

    # ─── Categories ──────────────────────────────────────────────────────────

    def _seed_categories(self):
        from apps.categories.models import Category

        cats = [
            {'name': 'Makeup', 'icon': '💄', 'desc': 'Lipsticks, foundations, blush, highlighters and more.'},
            {'name': 'Skincare', 'icon': '🌿', 'desc': 'Serums, moisturizers, toners and cleansers.'},
            {'name': 'Lip Care', 'icon': '💋', 'desc': 'Lip glosses, balms, liners and lipsticks.'},
            {'name': 'Eye Makeup', 'icon': '👁️', 'desc': 'Mascaras, kajal, eyeshadow and eyeliners.'},
            {'name': 'Face Care', 'icon': '✨', 'desc': 'Face washes, scrubs, face masks and more.'},
            {'name': 'Hair Care', 'icon': '💇', 'desc': 'Shampoos, conditioners, serums and treatments.'},
            {'name': 'Fragrance', 'icon': '🌸', 'desc': 'Perfumes, body mists and deodorants.'},
            {'name': 'Beauty Accessories', 'icon': '🎀', 'desc': 'Brushes, sponges and beauty tools.'},
        ]
        created = 0
        for c in cats:
            obj, new = Category.objects.get_or_create(
                name=c['name'],
                defaults={
                    'slug': slugify(c['name']),
                    'description': c['desc'],
                    'icon': c['icon'],
                    'is_active': True,
                    'display_order': cats.index(c),
                }
            )
            if new:
                created += 1
        self.stdout.write(f'  Categories: {created} created')

    # ─── Concerns ────────────────────────────────────────────────────────────

    def _seed_concerns(self):
        from apps.categories.models import Concern

        concerns = [
            'Hydration', 'Brightening', 'Acne Care',
            'Sensitive Skin', 'Anti-Aging', 'Oil Control',
            'Dark Circles', 'Daily Makeup',
        ]
        created = 0
        for name in concerns:
            _, new = Concern.objects.get_or_create(
                name=name,
                defaults={'slug': slugify(name), 'is_active': True}
            )
            if new:
                created += 1
        self.stdout.write(f'  Concerns: {created} created')

    # ─── Brands ──────────────────────────────────────────────────────────────

    def _seed_brands(self):
        from apps.products.models import Brand

        _, new = Brand.objects.get_or_create(
            name='AURA',
            defaults={
                'slug': 'aura',
                'description': 'Premium homegrown cosmetics brand — Made in India, loved everywhere.',
                'is_active': True,
            }
        )
        self.stdout.write(f'  Brand AURA: {"created" if new else "exists"}')

    # ─── Products ────────────────────────────────────────────────────────────

    def _seed_products(self):
        from apps.products.models import Brand, Product, ProductVariant
        from apps.categories.models import Category

        brand = Brand.objects.get(slug='aura')

        PRODUCTS = [
            # ── Makeup ───────────────────────────────────────────────────────
            {
                'name': 'AURA Velvet Matte Lipstick',
                'category': 'Makeup',
                'price': 399, 'mrp': 499, 'discount_percent': 20,
                'stock': 150,
                'short_description': 'Long-lasting velvet matte finish. Transfer-proof formula with vitamin E.',
                'description': (
                    'Introducing the AURA Velvet Matte Lipstick — a luxuriously smooth, pigment-rich formula '
                    'that delivers intense colour with a velvety matte finish. Enriched with Vitamin E and '
                    'jojoba oil, it keeps your lips hydrated and comfortable throughout the day. '
                    'Transfer-proof and long-lasting for up to 12 hours.'
                ),
                'ingredients': 'Ricinus Communis (Castor) Seed Oil, Candelilla Wax, Vitamin E, Jojoba Oil',
                'benefits': (
                    '• Intense pigmentation in one swipe\n'
                    '• Comfortable 12-hour wear\n'
                    '• Transfer-proof formula\n'
                    '• Enriched with Vitamin E for lip care\n'
                    '• Available in 12 beautiful shades'
                ),
                'how_to_use': (
                    '1. Exfoliate lips before application for best results.\n'
                    '2. Apply directly from bullet or use a lip brush for precision.\n'
                    '3. Start from the centre and blend outward.\n'
                    '4. For a fuller look, slightly overdraw your lip line.'
                ),
                'weight': '3.5g',
                'is_featured': True, 'is_best_seller': True, 'is_new_arrival': False,
                'rating': 4.8, 'review_count': 245,
                'tags': 'lipstick, matte, lip colour, makeup',
                'variants': [
                    {'type': 'Shade', 'name': 'Ruby Red', 'value': '#CC0000'},
                    {'type': 'Shade', 'name': 'Nude Rose', 'value': '#C68B8B'},
                    {'type': 'Shade', 'name': 'Berry Bliss', 'value': '#8B2E5F'},
                    {'type': 'Shade', 'name': 'Coral Crush', 'value': '#FF6B4A'},
                    {'type': 'Shade', 'name': 'Dusty Mauve', 'value': '#9B7B7B'},
                ],
            },
            {
                'name': 'AURA Glow Foundation',
                'category': 'Makeup',
                'price': 799, 'mrp': 999, 'discount_percent': 20,
                'stock': 120,
                'short_description': 'Buildable medium-to-full coverage foundation with a luminous finish.',
                'description': (
                    'The AURA Glow Foundation delivers a flawless, skin-like finish that looks natural in '
                    'every lighting. With buildable coverage and SPF 20, it works for all skin types. '
                    'Enriched with hyaluronic acid for all-day hydration.'
                ),
                'ingredients': 'Aqua, Titanium Dioxide, Hyaluronic Acid, Niacinamide, Glycerin',
                'benefits': (
                    '• Buildable coverage from sheer to full\n'
                    '• SPF 20 protection\n'
                    '• 24-hour hydration with hyaluronic acid\n'
                    '• Suitable for all skin types\n'
                    '• 15 shades for diverse skin tones'
                ),
                'how_to_use': (
                    '1. Apply primer for longer-lasting wear.\n'
                    '2. Dot foundation on forehead, cheeks, nose and chin.\n'
                    '3. Blend using a damp beauty sponge or foundation brush.\n'
                    '4. Build coverage where needed.'
                ),
                'weight': '30ml',
                'is_featured': True, 'is_best_seller': True, 'is_new_arrival': False,
                'rating': 4.6, 'review_count': 189,
                'tags': 'foundation, coverage, glow, makeup, spf',
                'variants': [
                    {'type': 'Shade', 'name': 'Porcelain N10'},
                    {'type': 'Shade', 'name': 'Warm Beige N20'},
                    {'type': 'Shade', 'name': 'Golden Sand N30'},
                    {'type': 'Shade', 'name': 'Caramel N40'},
                    {'type': 'Shade', 'name': 'Espresso N50'},
                ],
            },
            {
                'name': 'AURA Nude Eyeshadow Palette',
                'category': 'Eye Makeup',
                'price': 1499, 'mrp': 1799, 'discount_percent': 17,
                'stock': 80,
                'short_description': '12 highly-pigmented nudes — from light shimmer to deep matte.',
                'description': (
                    'A carefully curated palette of 12 nude shades ranging from champagne shimmer to '
                    'deep espresso matte. Buttery smooth formula with exceptional pigment payoff. '
                    'Long-wearing and blendable for endless eye looks.'
                ),
                'ingredients': 'Talc, Mica, Magnesium Stearate, Dimethicone, Vitamin E',
                'benefits': '• 12 versatile nude shades\n• Mix of mattes and shimmers\n• Long-wearing 16-hour formula',
                'how_to_use': (
                    '1. Apply transition shade on the crease.\n'
                    '2. Add shimmer shade to the lid.\n'
                    '3. Deepen the outer corner with dark shade.'
                ),
                'weight': '14g',
                'is_featured': True, 'is_best_seller': False, 'is_new_arrival': True,
                'rating': 4.5, 'review_count': 156,
                'tags': 'eyeshadow, palette, nude, makeup, eyes',
            },
            {
                'name': 'AURA Waterproof Kajal',
                'category': 'Eye Makeup',
                'price': 249, 'mrp': 299, 'discount_percent': 17,
                'stock': 200,
                'short_description': 'Smudge-proof, waterproof kajal. Intense black formula for defined eyes.',
                'description': (
                    'The AURA Waterproof Kajal delivers an intense, smudge-proof definition that lasts '
                    'all day. Enriched with kohl, it glides on effortlessly for precise or smoky looks.'
                ),
                'ingredients': 'Kohl, Hydrogenated Castor Oil, Vitamin E, Beeswax',
                'benefits': '• 24-hour waterproof wear\n• Smudge-proof formula\n• Intense jet black colour',
                'how_to_use': '1. Draw along lower waterline.\n2. Smudge for a smoky look or leave defined.',
                'weight': '0.35g',
                'is_featured': False, 'is_best_seller': True, 'is_new_arrival': False,
                'rating': 4.7, 'review_count': 312,
                'tags': 'kajal, kohl, waterproof, eye, makeup',
            },
            {
                'name': 'AURA Waterproof Mascara',
                'category': 'Eye Makeup',
                'price': 549, 'mrp': 699, 'discount_percent': 21,
                'stock': 95,
                'short_description': 'Lengthening & volumising waterproof mascara. No clumping.',
                'description': (
                    'AURA Waterproof Mascara features a 360° wand for full, clump-free coverage. '
                    'Formulated with conditioning agents that strengthen lashes while delivering '
                    'dramatic volume and length.'
                ),
                'ingredients': 'Aqua, Beeswax, Paraffin, Iron Oxide Black, Panthenol',
                'benefits': '• Lengthens and volumises\n• Clump-free formula\n• Waterproof 24 hours\n• Conditions lashes',
                'how_to_use': '1. Wiggle wand at lash base.\n2. Sweep upward in a zig-zag motion.\n3. Layer for more drama.',
                'weight': '8ml',
                'is_featured': False, 'is_best_seller': True, 'is_new_arrival': True,
                'rating': 4.6, 'review_count': 167,
                'tags': 'mascara, waterproof, lashes, eye, makeup',
            },
            # ── Skincare ─────────────────────────────────────────────────────
            {
                'name': 'AURA Hydrating Face Serum',
                'category': 'Skincare',
                'price': 1199, 'mrp': 1499, 'discount_percent': 20,
                'stock': 100,
                'short_description': '2% Hyaluronic Acid serum for deep hydration. Plumps and smooths skin.',
                'description': (
                    'A lightweight, fast-absorbing serum with 2% Hyaluronic Acid that draws moisture '
                    'deep into the skin. Combined with Vitamin B5 and aloe vera, it delivers instant '
                    'plumping and lasting hydration for all skin types, including sensitive skin.'
                ),
                'ingredients': 'Aqua, Sodium Hyaluronate (2%), Panthenol, Aloe Barbadensis, Glycerin, Niacinamide',
                'benefits': (
                    '• 72-hour deep hydration\n'
                    '• Plumps and smooths fine lines\n'
                    '• Suitable for all skin types including sensitive\n'
                    '• Oil-free, non-comedogenic\n'
                    '• Fragrance-free'
                ),
                'how_to_use': (
                    '1. Apply to clean, slightly damp skin.\n'
                    '2. Use 2-3 drops — press gently into skin.\n'
                    '3. Follow with moisturiser to lock in hydration.\n'
                    '4. Use morning and evening.'
                ),
                'weight': '30ml',
                'is_featured': True, 'is_best_seller': True, 'is_new_arrival': False,
                'rating': 4.9, 'review_count': 312,
                'tags': 'serum, hyaluronic acid, hydration, skincare, dry skin',
                'variants': [
                    {'type': 'Size', 'name': '30ml', 'price_modifier': 0},
                    {'type': 'Size', 'name': '50ml', 'price_modifier': 400},
                ],
            },
            {
                'name': 'AURA Vitamin C Brightening Serum',
                'category': 'Skincare',
                'price': 999, 'mrp': 1299, 'discount_percent': 23,
                'stock': 85,
                'short_description': '15% Vitamin C + Niacinamide for radiant, even-toned skin.',
                'description': (
                    'A potent brightening serum with 15% stabilised Vitamin C combined with '
                    'Niacinamide and Ferulic Acid. Targets dark spots, uneven tone and dullness '
                    'for visibly brighter skin in 4 weeks.'
                ),
                'ingredients': 'Ascorbic Acid (15%), Niacinamide (5%), Ferulic Acid, Vitamin E, Aqua',
                'benefits': '• Fades dark spots and hyperpigmentation\n• Brightens dull complexion\n• Antioxidant protection\n• Evens skin tone',
                'how_to_use': '1. Apply 2-3 drops on clean skin every morning.\n2. Follow with SPF moisturiser.\n3. Store away from sunlight.',
                'weight': '30ml',
                'is_featured': True, 'is_best_seller': False, 'is_new_arrival': True,
                'rating': 4.7, 'review_count': 278,
                'tags': 'vitamin c, brightening, dark spots, serum, skincare',
            },
            {
                'name': 'AURA Daily Moisturiser SPF 30',
                'category': 'Skincare',
                'price': 699, 'mrp': 899, 'discount_percent': 22,
                'stock': 130,
                'short_description': 'Lightweight everyday moisturiser with SPF 30. Non-greasy, all skin types.',
                'description': (
                    'Your everyday skin essential. The AURA Daily Moisturiser combines superior '
                    'hydration with SPF 30 protection. Lightweight formula absorbs in seconds, '
                    'leaving skin soft, plump and protected without a greasy finish.'
                ),
                'ingredients': 'Aqua, Glycerin, SPF 30 Filters, Shea Butter, Niacinamide, Aloe Vera',
                'benefits': '• SPF 30 broad-spectrum protection\n• 24-hour hydration\n• Non-greasy matte finish\n• Suitable for all skin types',
                'how_to_use': '1. Apply after serum as the last step of your morning routine.\n2. Smooth on face and neck.\n3. Follow with makeup if desired.',
                'weight': '50ml',
                'is_featured': False, 'is_best_seller': True, 'is_new_arrival': False,
                'rating': 4.8, 'review_count': 198,
                'tags': 'moisturiser, spf, sunscreen, hydration, skincare',
            },
            {
                'name': 'AURA Radiance Face Wash',
                'category': 'Face Care',
                'price': 349, 'mrp': 399, 'discount_percent': 13,
                'stock': 180,
                'short_description': 'Gentle brightening face wash with papaya enzymes. No sulphates.',
                'description': (
                    'A creamy, sulphate-free face wash enriched with papaya enzymes and Vitamin C '
                    'that gently exfoliates, brightens and cleanses without stripping natural oils. '
                    'Leaves skin feeling fresh, soft and radiant.'
                ),
                'ingredients': 'Aqua, Carica Papaya Enzyme, Ascorbic Acid, Glycerin, Aloe Vera Extract',
                'benefits': '• Gently exfoliates dead skin cells\n• Brightens and evens tone\n• Sulphate-free, pH balanced\n• Suitable for all skin types',
                'how_to_use': '1. Wet face with lukewarm water.\n2. Apply pea-sized amount, work into lather.\n3. Rinse thoroughly. Use twice daily.',
                'weight': '100ml',
                'is_featured': False, 'is_best_seller': True, 'is_new_arrival': False,
                'rating': 4.5, 'review_count': 223,
                'tags': 'face wash, cleanser, brightening, papaya, skincare',
            },
            # ── Lip Care ─────────────────────────────────────────────────────
            {
                'name': 'AURA Glazed Lip Gloss',
                'category': 'Lip Care',
                'price': 299, 'mrp': 399, 'discount_percent': 25,
                'stock': 160,
                'short_description': 'High-shine, non-sticky lip gloss. Plumps lips with a glossy finish.',
                'description': (
                    'The AURA Glazed Lip Gloss delivers a gorgeous mirror-shine finish with a '
                    'comfortable, non-sticky formula. Enriched with Vitamin E and peppermint oil '
                    'for a natural plumping effect and long-lasting shine.'
                ),
                'ingredients': 'Polybutene, Ricinus Communis Oil, Vitamin E, Peppermint Oil, Mica',
                'benefits': '• High-shine mirror finish\n• Non-sticky formula\n• Natural plumping effect\n• Conditions lips',
                'how_to_use': '1. Apply directly to lips using the doe-foot applicator.\n2. Layer over lip liner or lipstick for extra gloss.',
                'weight': '5ml',
                'is_featured': False, 'is_best_seller': False, 'is_new_arrival': True,
                'rating': 4.4, 'review_count': 134,
                'tags': 'lip gloss, shiny lips, gloss, makeup, lip care',
                'variants': [
                    {'type': 'Shade', 'name': 'Crystal Clear'},
                    {'type': 'Shade', 'name': 'Peachy Pink'},
                    {'type': 'Shade', 'name': 'Berry Glow'},
                ],
            },
            # ── Accessories ──────────────────────────────────────────────────
            {
                'name': 'AURA Beauty Blender',
                'category': 'Beauty Accessories',
                'price': 299, 'mrp': 399, 'discount_percent': 25,
                'stock': 200,
                'short_description': 'Ultra-soft latex-free beauty sponge for flawless foundation blending.',
                'description': (
                    'The AURA Beauty Blender is crafted from ultra-soft, latex-free material that '
                    'expands when wet for a seamless, streak-free application. Works with foundation, '
                    'concealer, blush and setting powder.'
                ),
                'ingredients': 'N/A — Beauty Tool',
                'benefits': '• Latex-free, hypoallergenic\n• Expands 2x when wet\n• Use wet or dry\n• Easy to clean',
                'how_to_use': '1. Wet sponge, squeeze out excess water.\n2. Dab (not drag) product onto skin for airbrushed finish.',
                'weight': '20g',
                'is_featured': False, 'is_best_seller': False, 'is_new_arrival': True,
                'rating': 4.7, 'review_count': 234,
                'tags': 'beauty sponge, blender, makeup tool, foundation, accessory',
                'variants': [
                    {'type': 'Colour', 'name': 'Nude Pink'},
                    {'type': 'Colour', 'name': 'Classic Black'},
                ],
            },
        ]

        created = 0
        for p_data in PRODUCTS:
            try:
                cat = Category.objects.get(name=p_data['category'])
            except Category.DoesNotExist:
                self.stdout.write(self.style.WARNING(f'  Category "{p_data["category"]}" not found, skipping'))
                continue

            variants_data = p_data.pop('variants', [])

            product, new = Product.objects.get_or_create(
                name=p_data['name'],
                defaults={
                    'slug': slugify(p_data['name']),
                    'sku': 'AURA-{:05d}'.format(abs(hash(p_data['name'])) % 100000),
                    'category': cat,
                    'brand': brand,
                    'price': Decimal(str(p_data['price'])),
                    'mrp': Decimal(str(p_data['mrp'])),
                    'discount_percent': p_data['discount_percent'],
                    'stock_quantity': p_data['stock'],
                    'short_description': p_data.get('short_description', ''),
                    'description': p_data.get('description', ''),
                    'ingredients': p_data.get('ingredients', ''),
                    'benefits': p_data.get('benefits', ''),
                    'how_to_use': p_data.get('how_to_use', ''),
                    'weight': p_data.get('weight', ''),
                    'is_featured': p_data.get('is_featured', False),
                    'is_best_seller': p_data.get('is_best_seller', False),
                    'is_new_arrival': p_data.get('is_new_arrival', False),
                    'is_active': True,
                    'rating': Decimal(str(p_data.get('rating', 0))),
                    'review_count': p_data.get('review_count', 0),
                    'tags': p_data.get('tags', ''),
                    'meta_title': p_data['name'],
                    'meta_description': p_data.get('short_description', '')[:160],
                }
            )

            if new:
                created += 1
                # Create variants
                for vd in variants_data:
                    ProductVariant.objects.create(
                        product=product,
                        variant_type=vd['type'],
                        name=vd['name'],
                        value=vd.get('value', ''),
                        price_modifier=Decimal(str(vd.get('price_modifier', 0))),
                        stock=product.stock_quantity,
                        is_active=True,
                    )

        self.stdout.write(f'  Products: {created} created')

    # ─── Coupons ─────────────────────────────────────────────────────────────

    def _seed_coupons(self):
        from apps.coupons.models import Coupon
        from django.utils import timezone
        from datetime import timedelta

        coupons = [
            {
                'code': 'AURA10',
                'description': '10% off your first order',
                'discount_type': 'percentage',
                'discount_value': Decimal('10'),
                'minimum_order_amount': Decimal('500'),
                'maximum_discount_amount': Decimal('200'),
                'usage_limit': 1000,
                'usage_limit_per_user': 1,
                'is_first_order_only': True,
                'valid_until': timezone.now() + timedelta(days=365),
            },
            {
                'code': 'FREESHIP',
                'description': 'Free shipping on any order',
                'discount_type': 'free_shipping',
                'discount_value': Decimal('0'),
                'minimum_order_amount': Decimal('0'),
                'usage_limit': 500,
                'usage_limit_per_user': 2,
                'is_first_order_only': False,
                'valid_until': timezone.now() + timedelta(days=90),
            },
            {
                'code': 'GLOW20',
                'description': 'Flat 20% off on all skincare',
                'discount_type': 'percentage',
                'discount_value': Decimal('20'),
                'minimum_order_amount': Decimal('800'),
                'maximum_discount_amount': Decimal('500'),
                'usage_limit': 200,
                'usage_limit_per_user': 1,
                'is_first_order_only': False,
                'valid_until': timezone.now() + timedelta(days=30),
            },
            {
                'code': 'FLAT150',
                'description': '₹150 off on orders above ₹1499',
                'discount_type': 'fixed',
                'discount_value': Decimal('150'),
                'minimum_order_amount': Decimal('1499'),
                'usage_limit': 300,
                'usage_limit_per_user': 1,
                'is_first_order_only': False,
                'valid_until': timezone.now() + timedelta(days=60),
            },
        ]
        created = 0
        for cd in coupons:
            _, new = Coupon.objects.get_or_create(code=cd['code'], defaults=cd)
            if new:
                created += 1
        self.stdout.write(f'  Coupons: {created} created')

    # ─── Homepage Banners ─────────────────────────────────────────────────────

    def _seed_homepage_banners(self):
        from apps.products.models import HomepageBanner, PromotionalBanner

        banners = [
            {
                'title': 'Reveal Your Natural Aura.',
                'subtitle': 'Beauty essentials designed for the modern Indian woman. Discover AURA.',
                'cta_text': 'Shop Collection',
                'cta_link': '/shop',
                'display_order': 1,
            },
            {
                'title': 'New Arrivals Are Here',
                'subtitle': 'Fresh beauty picks dropped every week. Be the first to discover.',
                'cta_text': 'Shop New Arrivals',
                'cta_link': '/shop?is_new_arrival=true',
                'display_order': 2,
            },
        ]
        promo = [
            {
                'title': 'Your Beauty Routine, Elevated.',
                'subtitle': 'Use code AURA10 for 10% off your first order.',
                'cta_text': 'Explore AURA',
                'cta_link': '/shop',
                'background_color': '#1A1A1A',
                'display_order': 1,
            },
        ]
        b_created = p_created = 0
        for bd in banners:
            _, new = HomepageBanner.objects.get_or_create(title=bd['title'], defaults={**bd, 'is_active': True})
            if new: b_created += 1
        for pd in promo:
            _, new = PromotionalBanner.objects.get_or_create(title=pd['title'], defaults={**pd, 'is_active': True})
            if new: p_created += 1
        self.stdout.write(f'  Banners: {b_created} hero, {p_created} promo created')
