import os
import django
import uuid
from decimal import Decimal
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'aura_erp.settings')
django.setup()

from django.utils import timezone
from apps.products.models import Product
from apps.crm.models import Contact, Lead, Activity
from apps.procurement.models import PurchaseOrder, PurchaseOrderItem
from apps.manufacturing.models import WorkCenter, BillOfMaterials, BOMItem, ProductionOrder
from apps.maintenance.models import Equipment, MaintenanceRequest
from apps.sales.models import Quotation, QuotationItem, Order, OrderItem, Invoice
from apps.inventory.models import Warehouse, StockItem

def seed_enterprise_modules():
    print("Seeding Complete Enterprise Modules (Procurement, Manufacturing, CMMS, CRM, Sales)...")
    now = timezone.now()
    today = now.date()

    # 1. CRM Contacts & Leads
    contacts_data = [
        {"name": "Elena Rostova", "email": "elena.r@quantum-dynamics.io", "phone": "+1 (555) 329-8472", "company": "Quantum Dynamics Corp", "job_title": "VP of Operations", "contact_type": "customer", "status": "active", "address": "742 Evergreen Terr, Austin, TX"},
        {"name": "Marcus Vance", "email": "m.vance@apexlogistics.com", "phone": "+1 (555) 781-9923", "company": "Apex Global Logistics", "job_title": "Chief Technology Officer", "contact_type": "customer", "status": "active", "address": "1200 Harbor Blvd, Seattle, WA"},
        {"name": "Dr. Aris Thorne", "email": "aris@biocore-pharma.org", "phone": "+1 (555) 642-1100", "company": "BioCore Pharmaceuticals", "job_title": "Supply Chain Director", "contact_type": "lead", "status": "negotiation", "address": "500 Discovery Way, Boston, MA"},
        {"name": "Sophia Chen", "email": "s.chen@hyperion-materials.com", "phone": "+1 (555) 902-3341", "company": "Hyperion Advanced Materials", "job_title": "Lead Procurement Officer", "contact_type": "vendor", "status": "active", "address": "88 Industrial Pkwy, Chicago, IL"},
        {"name": "Hiroshi Tanaka", "email": "tanaka@tokyo-precision.co.jp", "phone": "+81 3 5555 0192", "company": "Tokyo Precision Robotics", "job_title": "Global Accounts VP", "contact_type": "vendor", "status": "active", "address": "Minato-ku, Tokyo, Japan"},
        {"name": "David Miller", "email": "david@nexus-cloud.net", "phone": "+1 (555) 431-8876", "company": "Nexus Cloud Infrastructure", "job_title": "VP Strategic Alliances", "contact_type": "partner", "status": "active", "address": "100 Pine St, San Francisco, CA"},
    ]

    contact_objs = {}
    for cdata in contacts_data:
        obj, _ = Contact.objects.update_or_create(email=cdata['email'], defaults=cdata)
        contact_objs[obj.name] = obj

    leads_data = [
        {"title": "Multi-Facility ERP Migration - 500 Seats", "contact": contact_objs["Dr. Aris Thorne"], "estimated_value": Decimal("48500.00"), "stage": "proposal", "probability_percentage": 70, "source": "Enterprise Inbound RFQ", "notes": "Evaluating Aura ERP vs SAP S/4HANA for 3 pharmaceutical packaging plants."},
        {"title": "Automated WMS & Robotics Terminal Rollout", "contact": contact_objs["Marcus Vance"], "estimated_value": Decimal("64000.00"), "stage": "negotiation", "probability_percentage": 85, "source": "Executive Referral", "notes": "Final procurement sign-off on 4 distribution hub terminals."},
        {"title": "Shop Floor MRP & Work Center Scheduling", "contact": contact_objs["Elena Rostova"], "estimated_value": Decimal("32000.00"), "stage": "won", "probability_percentage": 100, "source": "Customer Expansion", "notes": "Closed enterprise license and custom discrete manufacturing modules."},
        {"title": "Predictive CMMS & Equipment IoT Pilot", "contact": contact_objs["Dr. Aris Thorne"], "estimated_value": Decimal("19500.00"), "stage": "demo_scheduled", "probability_percentage": 50, "source": "Webinar Attendee", "notes": "Demo scheduled for plant engineers to review MTBF metrics."},
        {"title": "Retail Chain POS & Multi-Tender Terminal", "contact": contact_objs["Elena Rostova"], "estimated_value": Decimal("22000.00"), "stage": "qualification", "probability_percentage": 40, "source": "Cold Outreach", "notes": "12 brick-and-mortar storefronts replacing legacy NCR cash registers."},
        {"title": "Global Partner Co-Sell Integration", "contact": contact_objs["David Miller"], "estimated_value": Decimal("15000.00"), "stage": "new", "probability_percentage": 25, "source": "Partner Ecosystem", "notes": "Cloud infrastructure connector bundle."},
    ]

    for ldata in leads_data:
        lead, _ = Lead.objects.update_or_create(title=ldata['title'], contact=ldata['contact'], defaults=ldata)
        # Seed activities for lead
        Activity.objects.get_or_create(
            contact=lead.contact,
            lead=lead,
            summary=f"Technical review call for {lead.title}",
            defaults={
                'activity_type': 'call',
                'details': 'Discussed multi-warehouse routing and high-availability failover.',
                'performed_by': 'Rachel Adams (Senior Solutions Architect)',
                'performed_at': now - timedelta(days=2)
            }
        )

    # 2. Procurement App (Purchase Orders & Items)
    vendor_hyperion = contact_objs["Sophia Chen"]
    vendor_tokyo = contact_objs["Hiroshi Tanaka"]
    prod_sample = Product.objects.first()

    po_data = [
        {
            "po_number": "PO-2026-901",
            "vendor": vendor_hyperion,
            "order_date": today - timedelta(days=14),
            "expected_date": today - timedelta(days=2),
            "status": "received",
            "subtotal": Decimal("24500.00"),
            "tax": Decimal("1225.00"),
            "total": Decimal("25725.00"),
            "notes": "Silicon wafer raw ingots for cleanroom semiconductor line.",
            "items": [
                {"item_name": "Ultra-Pure Polycrystalline Silicon (Grade 9N)", "quantity": 100, "unit_cost": Decimal("145.00"), "total_cost": Decimal("14500.00")},
                {"item_name": "Optical Quartz Substrate Discs (300mm)", "quantity": 50, "unit_cost": Decimal("200.00"), "total_cost": Decimal("10000.00")},
            ]
        },
        {
            "po_number": "PO-2026-902",
            "vendor": vendor_tokyo,
            "order_date": today - timedelta(days=5),
            "expected_date": today + timedelta(days=7),
            "status": "sent",
            "subtotal": Decimal("18400.00"),
            "tax": Decimal("920.00"),
            "total": Decimal("19320.00"),
            "notes": "Servo motors and optical encoders for CNC milling workstations.",
            "items": [
                {"item_name": "Brushless Servo Drive Motor 750W", "quantity": 20, "unit_cost": Decimal("620.00"), "total_cost": Decimal("12400.00")},
                {"item_name": "High-Resolution Rotary Encoders (24-bit)", "quantity": 30, "unit_cost": Decimal("200.00"), "total_cost": Decimal("6000.00")},
            ]
        },
        {
            "po_number": "PO-2026-903",
            "vendor": vendor_hyperion,
            "order_date": today - timedelta(days=1),
            "expected_date": today + timedelta(days=12),
            "status": "draft",
            "subtotal": Decimal("8900.00"),
            "tax": Decimal("445.00"),
            "total": Decimal("9345.00"),
            "notes": "Quarterly replenishments of structural anodized aluminum extrusion rails.",
            "items": [
                {"item_name": "T-Slot Anodized Aluminum Extrusions 40x40mm (3m)", "quantity": 150, "unit_cost": Decimal("46.00"), "total_cost": Decimal("6900.00")},
                {"item_name": "Heavy-Duty M8 Bracket Hardware Kits", "quantity": 100, "unit_cost": Decimal("20.00"), "total_cost": Decimal("2000.00")},
            ]
        },
        {
            "po_number": "PO-2026-904",
            "vendor": vendor_tokyo,
            "order_date": today - timedelta(days=28),
            "expected_date": today - timedelta(days=14),
            "status": "billed",
            "subtotal": Decimal("42000.00"),
            "tax": Decimal("2100.00"),
            "total": Decimal("44100.00"),
            "notes": "3-way matched and reconciled against bank payment ref #WIRE-8812.",
            "items": [
                {"item_name": "Industrial Robotic Articulated Arm (6-Axis)", "quantity": 2, "unit_cost": Decimal("21000.00"), "total_cost": Decimal("42000.00")},
            ]
        }
    ]

    for p in po_data:
        items = p.pop('items')
        po_obj, _ = PurchaseOrder.objects.update_or_create(po_number=p['po_number'], defaults=p)
        for it in items:
            PurchaseOrderItem.objects.get_or_create(po=po_obj, item_name=it['item_name'], defaults={**it, 'product': prod_sample})

    # 3. Manufacturing App (Work Centers, BOMs, Production Orders)
    workcenters_data = [
        {"code": "WC-ASM-01", "name": "Precision Assembly Cell A", "category": "Assembly & Fabrication", "hourly_rate": Decimal("85.00"), "capacity_hours_per_day": Decimal("16.00"), "is_active": True},
        {"code": "WC-CNC-02", "name": "5-Axis High-Speed CNC Milling", "category": "Machining & Subtractive", "hourly_rate": Decimal("140.00"), "capacity_hours_per_day": Decimal("20.00"), "is_active": True},
        {"code": "WC-SMT-03", "name": "Automated SMT PCB Surface Mount", "category": "Electronics & Soldering", "hourly_rate": Decimal("110.00"), "capacity_hours_per_day": Decimal("24.00"), "is_active": True},
        {"code": "WC-QA-04", "name": "Final QA, Burn-in & Optical Metrology", "category": "Inspection & Testing", "hourly_rate": Decimal("65.00"), "capacity_hours_per_day": Decimal("12.00"), "is_active": True},
    ]

    for wc in workcenters_data:
        WorkCenter.objects.update_or_create(code=wc['code'], defaults=wc)

    if prod_sample:
        bom1, _ = BillOfMaterials.objects.update_or_create(
            code="BOM-AURA-ENTERPRISE-01",
            defaults={
                "name": f"Core Standard Build - {prod_sample.name}",
                "finished_product": prod_sample,
                "quantity_produced": 1,
                "estimated_cost": Decimal("480.00"),
                "is_active": True,
                "notes": "Main manufacturing bill of materials with sub-assembly inspection."
            }
        )
        BOMItem.objects.get_or_create(bom=bom1, material_name="Anodized Aluminum Chassis Enclosure", defaults={"quantity_required": Decimal("1.00"), "unit_of_measure": "Pcs", "unit_cost": Decimal("120.00")})
        BOMItem.objects.get_or_create(bom=bom1, material_name="High-Density Power Supply Unit 850W", defaults={"quantity_required": Decimal("1.00"), "unit_of_measure": "Units", "unit_cost": Decimal("150.00")})
        BOMItem.objects.get_or_create(bom=bom1, material_name="Shielded Copper Harness Cable Assemblies", defaults={"quantity_required": Decimal("4.00"), "unit_of_measure": "Sets", "unit_cost": Decimal("35.00")})
        BOMItem.objects.get_or_create(bom=bom1, material_name="Silicone Thermal Interface Pads & Fasteners", defaults={"quantity_required": Decimal("10.00"), "unit_of_measure": "Kits", "unit_cost": Decimal("7.00")})

        mo_data = [
            {"order_number": "MO-2026-001", "bom": bom1, "planned_quantity": 25, "completed_quantity": 25, "status": "completed", "start_date": today - timedelta(days=10), "due_date": today - timedelta(days=2), "assigned_workstation": "Precision Assembly Cell A", "notes": "Batch QA certified 100% pass."},
            {"order_number": "MO-2026-002", "bom": bom1, "planned_quantity": 50, "completed_quantity": 28, "status": "in_progress", "start_date": today - timedelta(days=3), "due_date": today + timedelta(days=4), "assigned_workstation": "5-Axis High-Speed CNC Milling", "notes": "Shift 2 machining active."},
            {"order_number": "MO-2026-003", "bom": bom1, "planned_quantity": 40, "completed_quantity": 0, "status": "planned", "start_date": today + timedelta(days=2), "due_date": today + timedelta(days=12), "assigned_workstation": "Automated SMT PCB Surface Mount", "notes": "Awaiting raw silicon shipment delivery."},
            {"order_number": "MO-2026-004", "bom": bom1, "planned_quantity": 15, "completed_quantity": 15, "status": "quality_check", "start_date": today - timedelta(days=4), "due_date": today, "assigned_workstation": "Final QA, Burn-in & Optical Metrology", "notes": "Executing 24-hr burn-in stress test."},
        ]

        for mo in mo_data:
            ProductionOrder.objects.update_or_create(order_number=mo['order_number'], defaults=mo)

    # 4. Maintenance App (Equipment & Maintenance Requests)
    equip_data = [
        {"code": "EQ-HAAS-VF4", "name": "Haas VF-4SS Super-Speed CNC Vertical Mill", "category": "CNC Machining", "serial_number": "HAA-992384-TX", "location": "Building 1 - Bay 4 (Machining Wing)", "maintenance_frequency": "monthly", "last_maintenance_date": today - timedelta(days=22), "next_maintenance_date": today + timedelta(days=8), "status": "operational", "technician_in_charge": "Mark Sullivan"},
        {"code": "EQ-FANUC-R2000", "name": "FANUC R-2000iC Heavy Payload Industrial Robot", "category": "Robotics & Automation", "serial_number": "FNC-40192-JPN", "location": "Building 2 - Line C (Material Transfer)", "maintenance_frequency": "quarterly", "last_maintenance_date": today - timedelta(days=80), "next_maintenance_date": today + timedelta(days=10), "status": "operational", "technician_in_charge": "Alicia Sterling"},
        {"code": "EQ-CLEAN-HVAC-01", "name": "Trane Ultra-Cleanroom Recirculating Air Handler", "category": "HVAC & Cleanroom", "serial_number": "TRN-90218-CH", "location": "Cleanroom Sub-Roof Mezzanine", "maintenance_frequency": "monthly", "last_maintenance_date": today - timedelta(days=35), "next_maintenance_date": today - timedelta(days=5), "status": "under_maintenance", "technician_in_charge": "Carlos Mendez"},
        {"code": "EQ-YAMAHA-SMT", "name": "Yamaha YSM20R High-Speed Surface Mount Mounter", "category": "PCB Electronics", "serial_number": "YMH-88120-TY", "location": "Building 1 - Clean Floor Electronics Bay", "maintenance_frequency": "biweekly", "last_maintenance_date": today - timedelta(days=8), "next_maintenance_date": today + timedelta(days=6), "status": "operational", "technician_in_charge": "Kenji Sato"},
        {"code": "EQ-FORKLIFT-CAT03", "name": "Caterpillar 5,000 lb Lithium Electric Forklift", "category": "Warehouse Material Handling", "serial_number": "CAT-33910-IL", "location": "Warehouse Logistics Terminal A", "maintenance_frequency": "monthly", "last_maintenance_date": today - timedelta(days=45), "next_maintenance_date": today - timedelta(days=15), "status": "decommissioned", "technician_in_charge": "Sam Higgins"},
    ]

    equip_objs = {}
    for eq in equip_data:
        eobj, _ = Equipment.objects.update_or_create(code=eq['code'], defaults=eq)
        equip_objs[eq['code']] = eobj

    req_data = [
        {"ticket_number": "MREQ-2026-081", "equipment": equip_objs["EQ-CLEAN-HVAC-01"], "title": "HEPA Filter Differential Pressure Spike", "description": "Pressure differential gauge reading +1.8 inWC exceeding cleanroom ISO-6 compliance ceiling.", "priority": "critical", "status": "in_progress", "reported_by": "Dr. Vance (Lab Director)", "assigned_technician": "Carlos Mendez", "scheduled_date": today - timedelta(days=2), "notes": "Cleanroom operating under secondary air bypass. Replacement 0.3-micron HEPA packs delivered."},
        {"ticket_number": "MREQ-2026-082", "equipment": equip_objs["EQ-HAAS-VF4"], "title": "Spindle Chiller Fluid Inspection & Level Top-off", "description": "Routine 30-day thermal fluid check on 12,000 RPM inline spindle.", "priority": "low", "status": "resolved", "reported_by": "Floor Shift Lead", "assigned_technician": "Mark Sullivan", "scheduled_date": today - timedelta(days=5), "completion_date": today - timedelta(days=4), "notes": "Tested spindle temperature stability at 42 deg C. Operating nominal."},
        {"ticket_number": "MREQ-2026-083", "equipment": equip_objs["EQ-FANUC-R2000"], "title": "Axis-3 Harmonic Drive Grease Sampling & Backlash Calibration", "description": "Periodic vibration test identified minor harmonic resonance on joint 3.", "priority": "medium", "status": "open", "reported_by": "Automated Telemetry Sensor", "assigned_technician": "Alicia Sterling", "scheduled_date": today + timedelta(days=1), "notes": "Scheduled during Sunday planned plant shutdown."},
        {"ticket_number": "MREQ-2026-084", "equipment": equip_objs["EQ-YAMAHA-SMT"], "title": "Nozzle Feeder Calibration & Vacuum Sensor Cleanse", "description": "Feeder head 4 experiencing 0.05% pick-and-place component misfeeds.", "priority": "high", "status": "waiting_parts", "reported_by": "Kenji Sato", "assigned_technician": "Kenji Sato", "scheduled_date": today - timedelta(days=1), "notes": "Waiting for ceramic replacement vacuum nozzle tip set from manufacturer."},
    ]

    for rq in req_data:
        MaintenanceRequest.objects.update_or_create(ticket_number=rq['ticket_number'], defaults=rq)

    # 5. Sales App (Quotations, Orders, Invoices)
    cust_quantum = contact_objs["Elena Rostova"]
    cust_apex = contact_objs["Marcus Vance"]

    qtn_data = [
        {
            "quote_number": "QTN-2026-101",
            "customer": cust_quantum,
            "issue_date": today - timedelta(days=12),
            "valid_until": today + timedelta(days=18),
            "status": "converted",
            "subtotal": Decimal("38000.00"),
            "tax": Decimal("3800.00"),
            "total": Decimal("41800.00"),
            "notes": "Commercial contract for 200 Aura ERP Enterprise user licenses + dedicated cloud pod.",
            "items": [
                {"item_name": "Aura ERP Enterprise Annual Seat (Pack of 50)", "quantity": 4, "unit_price": Decimal("8500.00"), "total_price": Decimal("34000.00")},
                {"item_name": "Dedicated Virtual Private Cloud (VPC) Enterprise Pod", "quantity": 1, "unit_price": Decimal("4000.00"), "total_price": Decimal("4000.00")},
            ]
        },
        {
            "quote_number": "QTN-2026-102",
            "customer": cust_apex,
            "issue_date": today - timedelta(days=4),
            "valid_until": today + timedelta(days=26),
            "status": "sent",
            "subtotal": Decimal("24000.00"),
            "tax": Decimal("2400.00"),
            "total": Decimal("26400.00"),
            "notes": "Supply chain WMS terminal licenses across 4 distribution hubs.",
            "items": [
                {"item_name": "Aura WMS Logistics Scanner Multi-Facility License", "quantity": 4, "unit_price": Decimal("5000.00"), "total_price": Decimal("20000.00")},
                {"item_name": "On-Site Warehouse Integration Training & Calibration", "quantity": 1, "unit_price": Decimal("4000.00"), "total_price": Decimal("4000.00")},
            ]
        },
        {
            "quote_number": "QTN-2026-103",
            "customer": cust_quantum,
            "issue_date": today - timedelta(days=1),
            "valid_until": today + timedelta(days=30),
            "status": "draft",
            "subtotal": Decimal("15000.00"),
            "tax": Decimal("1500.00"),
            "total": Decimal("16500.00"),
            "notes": "Draft proposal for custom manufacturing MRP shop-floor terminal module.",
            "items": [
                {"item_name": "Aura Manufacturing Discrete MRP Shop Floor Extension", "quantity": 1, "unit_price": Decimal("15000.00"), "total_price": Decimal("15000.00")},
            ]
        }
    ]

    for q in qtn_data:
        qitems = q.pop('items')
        qobj, _ = Quotation.objects.update_or_create(quote_number=q['quote_number'], defaults=q)
        for qi in qitems:
            QuotationItem.objects.get_or_create(quotation=qobj, item_name=qi['item_name'], defaults={**qi, 'product': prod_sample})

    # Sales Orders & Invoices
    orders_data = [
        {"order_number": "ORD-2026-0081", "customer_name": "Elena Rostova", "customer_email": "elena.r@quantum-dynamics.io", "customer_phone": "+1 555-329-8472", "company_name": "Quantum Dynamics Corp", "billing_address": "742 Evergreen Terr, Austin, TX", "subtotal": Decimal("38000.00"), "discount_amount": Decimal("0.00"), "tax_amount": Decimal("3800.00"), "total_amount": Decimal("41800.00"), "payment_method": "wire_transfer", "status": "paid", "notes": "Converted from QTN-2026-101"},
        {"order_number": "ORD-2026-0082", "customer_name": "Marcus Vance", "customer_email": "m.vance@apexlogistics.com", "customer_phone": "+1 555-781-9923", "company_name": "Apex Global Logistics", "billing_address": "1200 Harbor Blvd, Seattle, WA", "subtotal": Decimal("18500.00"), "discount_amount": Decimal("500.00"), "tax_amount": Decimal("1800.00"), "total_amount": Decimal("19800.00"), "payment_method": "credit_card", "status": "paid", "notes": "Instant online self-serve subscription."},
    ]

    for ord_info in orders_data:
        o_obj, _ = Order.objects.update_or_create(order_number=ord_info['order_number'], defaults=ord_info)
        OrderItem.objects.get_or_create(order=o_obj, item_name="Enterprise Platform Annual License", defaults={"quantity": 1, "unit_price": ord_info['subtotal'], "total_price": ord_info['subtotal'], "product": prod_sample})
        
        inv_no = f"INV-2026-{o_obj.order_number[-4:]}"
        Invoice.objects.update_or_create(
            invoice_number=inv_no,
            defaults={
                "order": o_obj,
                "customer_name": o_obj.customer_name,
                "customer_email": o_obj.customer_email,
                "customer_company": o_obj.company_name,
                "issue_date": today - timedelta(days=7),
                "due_date": today + timedelta(days=23),
                "subtotal": o_obj.subtotal,
                "tax": o_obj.tax_amount,
                "total": o_obj.total_amount,
                "status": "paid"
            }
        )

    print("SUCCESS: All 5 Enterprise Modules Seeded with Realistic Operational Data!")

if __name__ == '__main__':
    seed_enterprise_modules()
