import os
import sys
import django
from decimal import Decimal
from datetime import date, timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aura_erp.settings')
django.setup()

from apps.inventory.models import Warehouse, BinLocation, StockItem, StockMovement
from apps.products.models import Product
from apps.sales.models import POSRegister, POSTransaction

def seed_inventory_pos():
    print("Seeding Inventory & POS System data...")

    # 1. Seed Warehouses
    warehouses_data = [
        {
            'code': 'WH-MAIN',
            'name': 'Central Logistics & Distribution Hub',
            'location': 'Palo Alto, California',
            'address': '1040 Innovation Parkway, Bldg B',
            'contact_phone': '+1 (650) 492-1000',
            'contact_email': 'wh-main@auraerp.internal',
            'manager': 'Robert Taylor',
            'capacity_sqft': 45000,
            'current_occupancy_pct': 74,
            'is_active': True,
        },
        {
            'code': 'WH-WEST',
            'name': 'West Coast Fast-Fulfillment Hub',
            'location': 'Seattle, Washington',
            'address': '820 Portway Ave, Terminal 5',
            'contact_phone': '+1 (206) 881-2940',
            'contact_email': 'wh-west@auraerp.internal',
            'manager': 'Marcus Vance',
            'capacity_sqft': 28000,
            'current_occupancy_pct': 58,
            'is_active': True,
        },
        {
            'code': 'WH-EU',
            'name': 'European Logistics Depot',
            'location': 'Frankfurt, Germany',
            'address': 'Flughafen CargoCity Sued, Tor 31',
            'contact_phone': '+49 69 9281-002',
            'contact_email': 'wh-eu@auraerp.internal',
            'manager': 'Liam O\'Connor',
            'capacity_sqft': 35000,
            'current_occupancy_pct': 82,
            'is_active': True,
        },
        {
            'code': 'WH-RETAIL',
            'name': 'Downtown Flagship Retail Front',
            'location': 'San Francisco, California',
            'address': '450 Market Street, Suite 100',
            'contact_phone': '+1 (415) 392-8810',
            'contact_email': 'store-sf@auraerp.internal',
            'manager': 'Sarah Jenkins',
            'capacity_sqft': 8500,
            'current_occupancy_pct': 46,
            'is_active': True,
        },
    ]

    warehouses = {}
    for wh_data in warehouses_data:
        code = wh_data.pop('code')
        wh, _ = Warehouse.objects.update_or_create(code=code, defaults=wh_data)
        warehouses[code] = wh
        print(f"  Warehouse: {wh.code} - {wh.name}")

        # Seed 3 Bin Locations per warehouse
        for zone, aisle, shelf in [('Zone A - High Density', 'Aisle 01', 'Tier 1'), ('Zone B - Bulk Pallet', 'Aisle 03', 'Tier 2'), ('Zone C - Dispatch Staging', 'Aisle 05', 'Tier 1')]:
            b_code = f"{wh.code}-{zone[:6].replace(' ', '')}-{aisle[-2:]}-{shelf[-1:]}"
            BinLocation.objects.get_or_create(
                bin_code=b_code,
                defaults={
                    'warehouse': wh,
                    'zone': zone,
                    'aisle': aisle,
                    'shelf': shelf,
                    'is_occupied': True,
                }
            )

    # 2. Seed Stock Items for products
    products = Product.objects.all()
    if not products.exists():
        print("  Creating base product catalog items...")
        p1 = Product.objects.create(name='Aura Edge Barcode Scanner (USB/BT)', sku='HW-SCAN-01', price=289.00, category='hardware', stock_quantity=150)
        p2 = Product.objects.create(name='Aura Touch POS Terminal 15.6"', sku='HW-POS-15', price=899.00, category='hardware', stock_quantity=80)
        p3 = Product.objects.create(name='Thermal Receipt Printer 80mm', sku='HW-PRN-80', price=179.00, category='hardware', stock_quantity=120)
        p4 = Product.objects.create(name='Heavy-Duty Cash Drawer (RJ12)', sku='HW-DRW-01', price=119.00, category='hardware', stock_quantity=95)
        p5 = Product.objects.create(name='Industrial RFID Pallet Tag (Pack of 100)', sku='HW-RFID-100', price=65.00, category='accessories', stock_quantity=450)
        products = Product.objects.all()

    main_wh = warehouses['WH-MAIN']
    retail_wh = warehouses['WH-RETAIL']
    west_wh = warehouses['WH-WEST']

    for i, prod in enumerate(products):
        # Stock in Central Hub
        unit_c = Decimal(str(round(float(prod.price) * 0.55, 2))) if prod.price > 0 else Decimal('45.00')
        bin_loc = main_wh.bins.first()

        s_main, _ = StockItem.objects.update_or_create(
            product=prod,
            warehouse=main_wh,
            defaults={
                'bin_location': bin_loc,
                'quantity_on_hand': 120 + (i * 15),
                'quantity_reserved': 10 + i,
                'reorder_level': 25,
                'reorder_quantity': 100,
                'unit_cost': unit_c,
                'last_counted_at': timezone.now() - timedelta(days=2),
            }
        )

        # Stock in Retail Front
        StockItem.objects.update_or_create(
            product=prod,
            warehouse=retail_wh,
            defaults={
                'bin_location': retail_wh.bins.first(),
                'quantity_on_hand': 25 + (i * 3),
                'quantity_reserved': 2,
                'reorder_level': 10,
                'reorder_quantity': 40,
                'unit_cost': unit_c,
                'last_counted_at': timezone.now() - timedelta(days=1),
            }
        )

        # Low stock indicator for 1 product
        if i == 0:
            StockItem.objects.update_or_create(
                product=prod,
                warehouse=west_wh,
                defaults={
                    'quantity_on_hand': 4, # Low stock alert
                    'quantity_reserved': 1,
                    'reorder_level': 15,
                    'reorder_quantity': 50,
                    'unit_cost': unit_c,
                    'last_counted_at': timezone.now() - timedelta(days=5),
                }
            )

    # 3. Seed Stock Movements
    first_p = products.first()
    second_p = products[1] if products.count() > 1 else first_p

    StockMovement.objects.get_or_create(
        reference_number='PO-REC-202611-001',
        defaults={
            'product': first_p,
            'to_warehouse': main_wh,
            'movement_type': 'receipt',
            'quantity': 250,
            'unit_cost': Decimal('145.00'),
            'performed_by': 'Robert Taylor',
            'notes': 'Vendor inbound container receipt PO #98210 from Zebra Tech',
        }
    )

    StockMovement.objects.get_or_create(
        reference_number='TRF-202611-002',
        defaults={
            'product': first_p,
            'from_warehouse': main_wh,
            'to_warehouse': retail_wh,
            'movement_type': 'transfer',
            'quantity': 35,
            'unit_cost': Decimal('145.00'),
            'performed_by': 'Sarah Jenkins',
            'notes': 'Inter-branch replenishment transfer to Downtown Flagship',
        }
    )

    StockMovement.objects.get_or_create(
        reference_number='ADJ-202611-003',
        defaults={
            'product': second_p,
            'to_warehouse': main_wh,
            'movement_type': 'adjustment',
            'quantity': 5,
            'unit_cost': Decimal('495.00'),
            'performed_by': 'Marcus Vance',
            'notes': 'Cycle count physical audit: +5 units reconciled in Zone B',
        }
    )

    # 4. Seed POS Register & Transactions
    register, _ = POSRegister.objects.get_or_create(
        name='Main Cashier Counter #01 (Front Register)',
        defaults={
            'store_location': 'San Francisco Downtown Flagship',
            'active_cashier': 'Sarah Jenkins',
            'opening_float': Decimal('250.00'),
            'current_cash': Decimal('1420.50'),
            'is_open': True,
            'opened_at': timezone.now() - timedelta(hours=6),
        }
    )
    print(f"  POS Register: {register.name} (Active: Sarah Jenkins)")

    # Seed 3 POS Transactions
    pos_samples = [
        {
            'receipt_number': 'POS-202611-A892B1',
            'cashier_name': 'Sarah Jenkins',
            'customer_name': 'Walk-in Enterprise Client',
            'payment_method': 'card',
            'subtotal': Decimal('1367.00'),
            'tax': Decimal('112.78'),
            'discount': Decimal('50.00'),
            'total_amount': Decimal('1429.78'),
            'amount_tendered': Decimal('1429.78'),
            'change_due': Decimal('0.00'),
            'items_data': [
                {'name': 'Aura Touch POS Terminal 15.6"', 'qty': 1, 'price': 899.00},
                {'name': 'Aura Edge Barcode Scanner (USB/BT)', 'qty': 1, 'price': 289.00},
                {'name': 'Thermal Receipt Printer 80mm', 'qty': 1, 'price': 179.00},
            ],
        },
        {
            'receipt_number': 'POS-202611-C349F2',
            'cashier_name': 'Sarah Jenkins',
            'customer_name': 'Retail Store Customer',
            'payment_method': 'cash',
            'subtotal': Decimal('119.00'),
            'tax': Decimal('9.82'),
            'discount': Decimal('0.00'),
            'total_amount': Decimal('128.82'),
            'amount_tendered': Decimal('150.00'),
            'change_due': Decimal('21.18'),
            'items_data': [
                {'name': 'Heavy-Duty Cash Drawer (RJ12)', 'qty': 1, 'price': 119.00},
            ],
        },
        {
            'receipt_number': 'POS-202611-E901D8',
            'cashier_name': 'Marcus Vance',
            'customer_name': 'Corporate Walk-in',
            'payment_method': 'qr',
            'subtotal': Decimal('650.00'),
            'tax': Decimal('53.63'),
            'discount': Decimal('25.00'),
            'total_amount': Decimal('678.63'),
            'amount_tendered': Decimal('678.63'),
            'change_due': Decimal('0.00'),
            'items_data': [
                {'name': 'Industrial RFID Pallet Tag (Pack of 100)', 'qty': 10, 'price': 65.00},
            ],
        },
    ]

    for tx in pos_samples:
        rec_no = tx.pop('receipt_number')
        POSTransaction.objects.update_or_create(
            receipt_number=rec_no,
            defaults={**tx, 'register': register}
        )

    print("Inventory & POS System seeding complete!")

if __name__ == '__main__':
    seed_inventory_pos()
