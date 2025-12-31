import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Professional PDF Generator Utility for First Love Church
 */
export const generateProfessionalPDF = ({
    title,
    subtitle,
    columns,
    rows,
    fileName,
    stats = [], // Array of { label, value, color }
    branding = "FIRST LOVE CHURCH"
}) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;

    // --- Colors ---
    const colors = {
        primary: [153, 27, 27], // Deep Red (#991B1B)
        secondary: [30, 41, 59], // Slate 800
        muted: [100, 116, 139], // Slate 500
        gold: [180, 83, 9],    // Gold (#B45309)
        white: [255, 255, 255]
    };

    // --- Header ---
    // Top Background
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, pageWidth, 45, 'F');

    // Branding / Church Name
    doc.setTextColor(...colors.white);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(branding, margin, 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('LOYALTY HOUSE INTERNATIONAL', margin, 27);

    // Title (Right Aligned)
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), pageWidth - margin, 20, { align: 'right' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    if (subtitle) {
        doc.text(subtitle, pageWidth - margin, 28, { align: 'right' });
    }

    // --- Stats Cards (Optional) ---
    let startY = 55;
    if (stats && stats.length > 0) {
        const cardWidth = (pageWidth - (2 * margin) - ((stats.length - 1) * 5)) / stats.length;
        const cardHeight = 22;

        stats.forEach((stat, index) => {
            const x = margin + (index * (cardWidth + 5));

            // Card Background
            doc.setFillColor(248, 250, 252); // Very light slate
            doc.setDrawColor(226, 232, 240); // Slate 200
            doc.roundedRect(x, startY, cardWidth, cardHeight, 2, 2, 'FD');

            // Bottom Border (Accent)
            doc.setDrawColor(...(stat.color || colors.gold));
            doc.setLineWidth(1);
            doc.line(x + 2, startY + cardHeight - 1, x + cardWidth - 2, startY + cardHeight - 1);

            // Label
            doc.setTextColor(...colors.muted);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text(stat.label.toUpperCase(), x + (cardWidth / 2), startY + 7, { align: 'center' });

            // Value
            doc.setTextColor(...colors.secondary);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(String(stat.value), x + (cardWidth / 2), startY + 16, { align: 'center' });
        });
        startY += cardHeight + 10;
    }

    // --- Table ---
    doc.autoTable({
        startY: startY,
        head: [columns],
        body: rows,
        theme: 'striped',
        headStyles: {
            fillColor: colors.primary,
            textColor: colors.white,
            fontSize: 10,
            fontStyle: 'bold',
            halign: 'center'
        },
        styles: {
            fontSize: 9,
            cellPadding: 4,
            valign: 'middle'
        },
        alternateRowStyles: {
            fillColor: [250, 250, 250]
        },
        margin: { left: margin, right: margin },
        didDrawPage: (data) => {
            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(...colors.muted);

            // Footer Line
            doc.setDrawColor(226, 232, 240);
            doc.setLineWidth(0.5);
            doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

            // Left Text
            doc.text('Généré le ' + new Date().toLocaleString('fr-FR'), margin, pageHeight - 10);

            // Center Text
            doc.text('Database Management System - First Love Church', pageWidth / 2, pageHeight - 10, { align: 'center' });

            // Right Text (Page Number)
            doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber} sur ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
        }
    });

    doc.save(`${fileName || 'Rapport'}.pdf`);
};
