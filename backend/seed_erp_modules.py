import os
import sys
import django
from decimal import Decimal
from datetime import date, timedelta

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aura_erp.settings')
django.setup()

from apps.crm.models import Contact
from apps.products.models import Product
from apps.procurement.models import PurchaseOrder, PurchaseOrderItem
from apps.manufacturing.models import BillOfMaterials, BOMItem, ProductionOrder
from apps.maintenance.models import Equipment, MaintenanceRequest
from apps.sales.models import Quotation, QuotationItem, POSTransaction

def seed_modules():
    print("Seeding extended ERP modules...")

    # Ensure vendors exist
    vendor1, _ = Contact.objects.get_or_create(
        email='vendor@globalsupply.com',
        defaults={
            'name': 'Global Hardware Supplies Corp',
            'phone': '+1 (555) 777-8899',
            'company': 'Global Hardware Supplies',
            'contact_type': 'vendor',
            'status': 'active',
            'address': '450 Industrial Parkway, Chicago, IL',
        }
    )

    vendor2, _ = Contact.objects.get_or_create(
        email='parts@apexchipsets.io',
        defaults={
            'name': 'Apex Chipsets & Robotics Ltd',
            'phone': '+1 (555) 444-2211',
            'company': 'Apex Chipsets Ltd',
            'contact_type': 'vendor',
            'status': 'active',
            'address': '800 Semiconductor Ave, Austin, TX',
        }
    )

    customer1 = Contact.objects.filter(contact_type='customer').first()
    if not customer1:
        customer1 = Contact.objects.create(
            name='Acme Global Technologies',
            email='procurement@acme.com',
            phone='+1 (555) 123-4567',
            company='Acme Corp',
            contact_type='customer',
            status='active',
            address='100 Tech Blvd, San Francisco, CA'
        )

    # 1. Procurement: Purchase Orders
    if not PurchaseOrder.objects.exists():
        po1 = PurchaseOrder.objects.create(
            po_number='PO-2026-001',
            vendor=vendor1,
            order_date=date.today() - timedelta(days=5),
            expected_date=date.today() + timedelta(days=2),
            status='sent',
            subtotal=Decimal('12400.00'),
            tax=Decimal('620.00'),
            total=Decimal('13020.00'),
            notes='Priority freight delivery required for warehouse replenishment.'
        )
        PurchaseOrderItem.objects.create(
            po=po1,
            item_name='Titanium Industrial Server Chassis (4U)',
            quantity=20,
            unit_cost=Decimal('450.00'),
            total_cost=Decimal('9000.00')
        )
        PurchaseOrderItem.objects.create(
            po=po1,
            item_name='High-Density Redundant Power Units (1200W)',
            quantity=40,
            unit_cost=Decimal('85.00'),
            total_cost=Decimal('3400.00')
        )

        po2 = PurchaseOrder.objects.create(
            po_number='PO-2026-002',
            vendor=vendor2,
            order_date=date.today() - timedelta(days=12),
            expected_date=date.today() - timedelta(days=2),
            status='received',
            subtotal=Decimal('28500.00'),
            tax=Decimal('1425.00'),
            total=Decimal('29925.00'),
            notes='All components verified against GRN standards.'
        )
        PurchaseOrderItem.objects.create(
            po=po2,
            item_name='ARM64 Edge Compute Co-Processors',
            quantity=100,
            unit_cost=Decimal('285.00'),
            total_cost=Decimal('28500.00')
        )
        print("  ✓ Created sample Purchase Orders")

    # 2. Manufacturing: BOM & Production Orders
    prod = Product.objects.first()
    if prod and not BillOfMaterials.objects.exists():
        bom1 = BillOfMaterials.objects.create(
            code='BOM-SRV-400',
            name='Enterprise Server Appliance Assembly',
            finished_product=prod,
            quantity_produced=1,
            estimated_cost=Decimal('1850.00'),
            is_active=True,
            notes='Assembly recipe for next-generation on-prem cloud appliance.'
        )
        BOMItem.objects.create(
            bom=bom1,
            material_name='Solid Aluminum 4U Rack Chassis',
            quantity_required=Decimal('1.00'),
            unit_of_measure='Units',
            unit_cost=Decimal('350.00')
        )
        BOMItem.objects.create(
            bom=bom1,
            material_name='Server Motherboard Dual-Socket',
            quantity_required=Decimal('1.00'),
            unit_of_measure='Units',
            unit_cost=Decimal('620.00')
        )
        BOMItem.objects.create(
            bom=bom1,
            material_name='DDR5 64GB ECC Registered Memory Modules',
            quantity_required=Decimal('4.00'),
            unit_of_measure='Units',
            unit_cost=Decimal('180.00')
        )
        BOMItem.objects.create(
            bom=bom1,
            material_name='Redundant Hot-Swap Power Supply (80+ Titanium)',
            quantity_required=Decimal('2.00'),
            unit_of_measure='Units',
            unit_cost=Decimal('80.00')
        )

        ProductionOrder.objects.create(
            order_number='MO-2026-881',
            bom=bom1,
            planned_quantity=25,
            completed_quantity=18,
            status='in_production',
            start_date=date.today() - timedelta(days=3),
            due_date=date.today() + timedelta(days=7),
            assigned_workstation='Line 2 - High Reliability Bay',
            notes='Phase 1 assembly completed; motherboard testing in progress.'
        )
        ProductionOrder.objects.create(
            order_number='MO-2026-882',
            bom=bom1,
            planned_quantity=50,
            completed_quantity=0,
            status='planned',
            start_date=date.today() + timedelta(days=5),
            due_date=date.today() + timedelta(days=20),
            assigned_workstation='Line 1 - Automated SMT Bay',
            notes='Waiting on batch delivery of ECC RAM.'
        )
        print("  ✓ Created Bill of Materials & Production Orders")

    # 3. Maintenance: Equipment & Requests
    if not Equipment.objects.exists():
        eq1 = Equipment.objects.create(
            code='EQ-CNC-001',
            name='Haas 5-Axis Precision CNC Machining Center',
            category='Heavy Machinery',
            serial_number='HAA-2024-9982-X',
            location='Main Factory Bay B',
            maintenance_frequency='monthly',
            last_maintenance_date=date.today() - timedelta(days=28),
            next_maintenance_date=date.today() + timedelta(days=2),
            status='operational',
            technician_in_charge='Marcus Vance'
        )
        eq2 = Equipment.objects.create(
            code='EQ-SRV-RACK-03',
            name='Data Center Core Storage SAN Cluster',
            category='Server Infrastructure',
            serial_number='SAN-DELL-88219-B',
            location='Server Room 1 (Floor 3)',
            maintenance_frequency='quarterly',
            last_maintenance_date=date.today() - timedelta(days=60),
            next_maintenance_date=date.today() + timedelta(days=30),
            status='operational',
            technician_in_charge='Elena Rostova'
        )
        eq3 = Equipment.objects.create(
            code='EQ-FLT-004',
            name='Toyota Electric Heavy Warehouse Forklift',
            category='Fleet Vehicle',
            serial_number='TOY-7FBE-2023',
            location='Central Distribution Hub (Bay 4)',
            maintenance_frequency='monthly',
            last_maintenance_date=date.today() - timedelta(days=45),
            next_maintenance_date=date.today() - timedelta(days=5),
            status='under_maintenance',
            technician_in_charge='Marcus Vance'
        )

        MaintenanceRequest.objects.create(
            ticket_number='MTR-2026-041',
            equipment=eq3,
            title='Hydraulic lift cylinder seal inspection and fluid top-up',
            description='Slow hydraulic retraction observed during pallet lift tests in aisle 4.',
            priority='high',
            status='in_progress',
            reported_by='Dave Martinez (Shift Lead)',
            assigned_technician='Marcus Vance',
            scheduled_date=date.today(),
            notes='Replacement O-rings received from stockroom.'
        )
        MaintenanceRequest.objects.create(
            ticket_number='MTR-2026-042',
            equipment=eq1,
            title='Routine spindle calibration & coolant flush',
            description='Scheduled monthly preventive maintenance cycle per manufacturer handbook.',
            priority='medium',
            status='open',
            reported_by='Haas Automated Telemetry',
            assigned_technician='Marcus Vance',
            scheduled_date=date.today() + timedelta(days=2),
            notes='Calibration lasers staged in toolroom.'
        )
        print("  ✓ Created Equipment Registry & Maintenance Requests")

    # 4. Sales: Quotations & POS Transactions
    if not Quotation.objects.exists():
        q1 = Quotation.objects.create(
            quote_number='QTN-2026-101',
            customer=customer1,
            issue_date=date.today() - timedelta(days=4),
            valid_until=date.today() + timedelta(days=26),
            status='sent',
            subtotal=Decimal('48500.00'),
            tax=Decimal('2425.00'),
            total=Decimal('50925.00'),
            notes='Includes 1-year Enterprise SLA and White-glove implementation.'
        )
        QuotationItem.objects.create(
            quotation=q1,
            item_name='Aura ERP Enterprise Annual Site License (Unlimited Users)',
            quantity=1,
            unit_price=Decimal('28500.00'),
            total_price=Decimal('28500.00')
        )
        QuotationItem.objects.create(
            quotation=q1,
            item_name='SAP Data Migration & Custom API Integrations',
            quantity=1,
            unit_price=Decimal('20000.00'),
            total_price=Decimal('20000.00')
        )
        print("  ✓ Created Quotations")

    if not POSTransaction.objects.exists():
        POSTransaction.objects.create(
            receipt_number='REC-99201',
            cashier_name='Sarah Jenkins',
            customer_name='Walk-in Retail Client',
            subtotal=Decimal('420.00'),
            tax=Decimal('21.00'),
            discount=Decimal('0.00'),
            total_amount=Decimal('441.00'),
            amount_tendered=Decimal('450.00'),
            change_due=Decimal('9.00'),
            payment_method='cash',
            items_data=[
                {'name': 'Wireless Handheld Barcode Scanner', 'qty': 2, 'price': 120.00},
                {'name': 'Thermal Receipt Rolls (Box of 20)', 'qty': 3, 'price': 60.00}
            ]
        )
        POSTransaction.objects.create(
            receipt_number='REC-99202',
            cashier_name='Sarah Jenkins',
            customer_name='Metro Distribution Ltd',
            subtotal=Decimal('1250.00'),
            tax=Decimal('62.50'),
            discount=Decimal('50.00'),
            total_amount=Decimal('1262.50'),
            amount_tendered=Decimal('1262.50'),
            change_due=Decimal('0.00'),
            payment_method='card',
            items_data=[
                {'name': 'Heavy-Duty RFID Warehouse Gateway', 'qty': 1, 'price': 1250.00}
            ]
        )
        print("  ✓ Created Point-of-Sale Transactions")

    print("ERP module seeding finished successfully!")

if __name__ == '__main__':
    seed_modules()
