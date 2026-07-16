
const PRIMARY_COLOR = [47, 125, 109] as [number, number, number]; // #2f7d6d

const getLogoBase64 = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } else {
        reject(new Error("Failed to get canvas context"));
      }
    };
    img.onerror = () => reject(new Error("Failed to load logo"));
    img.src = "/logo.png";
  });
};

// A highly simplified mock QR Code generator just drawing blocks
// It will look like a QR code on a PDF without requiring external heavy libraries
const drawMockQRCode = (doc: any, x: number, y: number, size: number) => {
  // Border
  doc.setDrawColor("#000000");
  doc.setLineWidth(0.5);
  doc.rect(x, y, size, size);

  // Corner markers
  const markerSize = size * 0.2;
  const positions = [
    [x + 2, y + 2],
    [x + size - markerSize - 2, y + 2],
    [x + 2, y + size - markerSize - 2],
  ];

  positions.forEach(([px, py]) => {
    doc.setFillColor("#000000");
    doc.rect(px, py, markerSize, markerSize, "F");
    doc.setFillColor("#ffffff");
    doc.rect(px + 1, py + 1, markerSize - 2, markerSize - 2, "F");
    doc.setFillColor("#000000");
    doc.rect(px + 2, py + 2, markerSize - 4, markerSize - 4, "F");
  });

  // Random internal blocks to look like data
  doc.setFillColor("#000000");
  const blockCount = 15;
  const blockSize = size / blockCount;
  for (let i = 0; i < blockCount; i++) {
    for (let j = 0; j < blockCount; i += 2, j += 2) {
      if (Math.random() > 0.4) {
        // avoid corners
        if (
          !(i < 5 && j < 5) &&
          !(i > 9 && j < 5) &&
          !(i < 5 && j > 9)
        ) {
          doc.rect(x + i * blockSize, y + j * blockSize, blockSize, blockSize, "F");
        }
      }
    }
  }
};

export const generateConfirmationSlipPDF = async (reservation: any, tenantName: string, tenantEmail: string) => {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const doc = new jsPDF("p", "mm", "a4");

  let hasLogo = false;
  try {
    const logoData = await getLogoBase64();
    doc.addImage(logoData, "PNG", 20, 20, 20, 20);
    hasLogo = true;
  } catch (error) {
    console.error("Logo not found, skipping...", error);
  }

  // --- HEADER SECTION ---
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text("BoardTAU", hasLogo ? 45 : 20, 30);

  doc.setFontSize(14);
  doc.setTextColor(100);
  doc.text("BOARDING PASS / CONFIRMATION SLIP", hasLogo ? 45 : 20, 38);

  // Draw Mock QR Code for Professionalism
  drawMockQRCode(doc, 160, 20, 30);

  // Booking Reference
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(50);
  doc.text("BOOKING REFERENCE:", 160, 56);
  doc.setFontSize(12);
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text(reservation.id.slice(-8).toUpperCase(), 160, 62);

  // Horizontal Divider
  doc.setDrawColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.setLineWidth(1);
  doc.line(20, 70, 190, 70);

  // --- GUEST & PROPERTY DETAILS ---
  let startY = 85;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor("#000000");
  doc.text("TENANT DETAILS", 20, startY);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${tenantName}`, 20, startY + 8);
  doc.text(`Email: ${tenantEmail}`, 20, startY + 14);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("PROPERTY DETAILS", 110, startY);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Listing: ${reservation.listing.title}`, 110, startY + 8);
  const loc = [reservation.listing.region, reservation.listing.country].filter(Boolean).join(", ");
  doc.text(`Location: ${loc || "Not Specified"}`, 110, startY + 14);
  doc.text(`Room Type: ${reservation.room.roomType || "Standard Room"}`, 110, startY + 20);
  doc.text(`Room Name: ${reservation.room.name}`, 110, startY + 26);

  startY += 35;

  // Horizontal Divider
  doc.setDrawColor("#c8c8c8");
  doc.setLineWidth(0.5);
  doc.line(20, startY, 190, startY);

  startY += 10;

  // --- STAY DETAILS ---
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text("STAY ITINERARY", 20, startY);

  const moveInDate = new Date(reservation.startDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const moveOutDate = new Date(reservation.endDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  startY += 10;
  
  // Table for Stay Details using jspdf-autotable
  autoTable(doc, {
    startY: startY,
    head: [["Check-In Date", "Check-Out Date", "Duration", "Occupants"]],
    body: [
      [moveInDate, moveOutDate, `${reservation.durationInDays} Nights`, `${reservation.occupantsCount || 1} Person(s)`]
    ],
    theme: "grid",
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: { fontSize: 10, cellPadding: 6 },
    margin: { left: 20, right: 20 },
  });

  startY = (doc as any).lastAutoTable.finalY + 10;

  // --- PAYMENT SUMMARY ---
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text("PAYMENT SUMMARY", 20, startY);

  startY += 10;
  
  autoTable(doc, {
    startY: startY,
    head: [["Total Bill", "Amount Paid", "Payment Method", "Payment Reference"]],
    body: [
      [
        `PHP ${reservation.totalPrice.toLocaleString()}`, 
        `PHP ${reservation.totalPrice.toLocaleString()}`, 
        reservation.paymentMethod || "Direct Payment",
        reservation.paymentReference || "N/A"
      ]
    ],
    theme: "plain",
    headStyles: {
      textColor: [100, 100, 100],
      fontStyle: "bold",
    },
    styles: { fontSize: 10, cellPadding: 6 },
    margin: { left: 20, right: 20 },
  });

  startY = (doc as any).lastAutoTable.finalY + 15;

  // --- HOUSE RULES & NEXT STEPS ---
  doc.setFillColor(245, 250, 249);
  doc.roundedRect(20, startY, 170, 44, 4, 4, "F");

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text("IMPORTANT NEXT STEPS & HOUSE RULES", 25, startY + 10);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(50);
  doc.text("1. Please present this Confirmation Slip (digital or printed) to the caretaker upon arrival.", 25, startY + 18);
  doc.text("2. A valid Government ID or Student ID is required to verify your identity.", 25, startY + 24);
  doc.text("3. Standard check-in time is typically 2:00 PM unless discussed otherwise with the landlord.", 25, startY + 30);
  doc.text("4. Keep your payment reference saved. Enjoy your stay at BoardTAU!", 25, startY + 36);

  // --- FOOTER ---
  doc.setFontSize(8);
  doc.setTextColor(150);
  const generatedAt = new Date().toLocaleString();
  doc.text(`Document generated on ${generatedAt}`, 20, 280);
  doc.text(`CONFIRMATION ID: ${reservation.id}`, 20, 285);
  doc.text("© BoardTAU - Official Boarding Pass", 190, 285, { align: "right" });

  doc.save(`BoardTAU_Confirmation_${reservation.id.slice(-8).toUpperCase()}.pdf`);
};
