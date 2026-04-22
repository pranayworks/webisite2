import { jsPDF } from "jspdf";
import "jspdf-autotable";

export const generateGSTInvoice = (order: any) => {
  const doc = new jsPDF() as any;
  const companyName = order.company_name || order.steward_name || "Steward";
  const gstNumber = order.gst_number || "N/A";
  const date = new Date(order.created_at).toLocaleDateString();

  // Header
  doc.setFontSize(20);
  doc.setTextColor(178, 244, 50); // Accent color #b2f432
  doc.text("GREEN LEGACY", 105, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Universal Stewardship Commission • 80G Compliant Environmental Service", 105, 28, { align: "center" });

  // Invoice Details
  doc.setTextColor(0);
  doc.setFontSize(14);
  doc.text("TAX INVOICE", 20, 45);
  
  doc.setFontSize(10);
  doc.text(`Invoice # GL-INV-${order.id.substring(0, 8).toUpperCase()}`, 20, 52);
  doc.text(`Date: ${date}`, 20, 58);
  doc.text(`GSTIN: ${gstNumber}`, 20, 64);

  // Billing To
  doc.setFontSize(12);
  doc.text("BILL TO:", 20, 80);
  doc.setFontSize(10);
  doc.text(companyName, 20, 86);
  doc.text(order.steward_name || "", 20, 92);

  // Items Table
  const tableData = [
    [
      "1",
      `Biological Impact Asset: ${order.plan_name || 'Forest Sapling'}`,
      `${order.trees} Trees`,
      `₹${(order.amount_paid || 0).toLocaleString()}`
    ]
  ];

  doc.autoTable({
    startY: 105,
    head: [["S.NO", "ITEM DESCRIPTION", "QUANTITY", "AMOUNT"]],
    body: tableData,
    headStyles: { fillColor: [178, 244, 50], textColor: [35, 54, 0] },
    theme: 'grid'
  });

  const finalY = doc.lastAutoTable.finalY + 10;

  // Totals
  doc.setFontSize(10);
  doc.text(`Subtotal:`, 140, finalY);
  doc.text(`₹${(order.amount_paid || 0).toLocaleString()}`, 180, finalY, { align: "right" });
  
  doc.text(`GST (Included):`, 140, finalY + 6);
  doc.text(`₹0.00`, 180, finalY + 6, { align: "right" });

  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text(`Total Contribution:`, 140, finalY + 14);
  doc.text(`₹${(order.amount_paid || 0).toLocaleString()}`, 180, finalY + 14, { align: "right" });

  // Footer
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(150);
  doc.text("Thank you for establishing a biological legacy. This invoice is digitally verified.", 105, 280, { align: "center" });

  doc.save(`GreenLegacy_Invoice_${order.id.substring(0, 8)}.pdf`);
};
