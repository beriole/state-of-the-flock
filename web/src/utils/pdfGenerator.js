import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Premium PDF Generator Utility for First Love Church
 * Redesigned for a professional, high-end appearance.
 */
export const generateProfessionalPDF = ({
    title,
    subtitle,
    columns = [],
    rows = [],
    fileName,
    stats = [], // Array of { label, value, color, icon }
    branding = "FIRST LOVE CHURCH"
}) => {
    try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;

        // --- Design Tokens (Modern Palette) ---
        const colors = {
            primary: [185, 28, 28],     // Deep Red (Church Brand)
            accent: [220, 38, 38],      // Brighter Red
            secondary: [15, 23, 42],    // Slate 900
            slate: [71, 85, 105],      // Slate 600
            light: [250, 250, 250],     // Subtle Gray
            border: [230, 230, 230],    // Light Gray
            white: [255, 255, 255]
        };

        // --- Background & Header ---
        // Clean Header (White Background)
        doc.setFillColor(...colors.white);
        doc.rect(0, 0, pageWidth, 60, 'F');

        // Branding & Logo
        const logoSize = 18;
        const logoX = (pageWidth - logoSize) / 2;
        try {
            // Using a standard public path that should be accessible in the browser
            doc.addImage('/church_logo.png', 'PNG', logoX, 10, logoSize, logoSize);
        } catch (e) {
            console.warn("Logo not found at /church_logo.png, skipping image.");
        }

        doc.setTextColor(...colors.primary);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text(branding, pageWidth / 2, 35, { align: 'center' });

        // Decorative Accent Line
        doc.setDrawColor(...colors.primary);
        doc.setLineWidth(0.5);
        doc.line(margin, 38, pageWidth - margin, 38);

        // Report Title & Meta
        doc.setTextColor(...colors.secondary);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(title.toUpperCase(), pageWidth / 2, 48, { align: 'center' });

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...colors.slate);
        if (subtitle) {
            doc.text(subtitle, pageWidth / 2, 54, { align: 'center' });
        }

        // --- Dashboard / Stats Section ---
        let startY = 65;
        if (stats && stats.length > 0) {
            const gap = 5;
            const containerWidth = pageWidth - (2 * margin);
            const cardWidth = (containerWidth - (gap * (stats.length - 1))) / stats.length;
            const cardHeight = 25;

            stats.forEach((stat, index) => {
                const x = margin + (index * (cardWidth + gap));

                // Shadow simulation
                doc.setFillColor(0, 0, 0, 0.05);
                doc.roundedRect(x + 1, startY + 1, cardWidth, cardHeight, 3, 3, 'F');

                // Card Base
                doc.setFillColor(...colors.white);
                doc.setDrawColor(...colors.border);
                doc.setLineWidth(0.5);
                doc.roundedRect(x, startY, cardWidth, cardHeight, 3, 3, 'FD');

                // Accent line on left
                doc.setFillColor(...(stat.color || colors.accent));
                doc.rect(x, startY + 5, 2, cardHeight - 10, 'F');

                // Label
                doc.setTextColor(...colors.slate);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'bold');
                doc.text(stat.label.toUpperCase(), x + 6, startY + 10);

                // Value
                doc.setTextColor(...colors.primary);
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text(String(stat.value), x + 6, startY + 19);
            });
            startY += cardHeight + 15;
        }

        // --- Main Content Table ---
        if (columns.length > 0) {
            autoTable(doc, {
                startY: startY,
                head: [columns],
                body: rows,
                theme: 'grid',
                headStyles: {
                    fillColor: colors.primary,
                    textColor: colors.white,
                    fontSize: 9,
                    fontStyle: 'bold',
                    halign: 'center',
                    cellPadding: 5,
                    lineWidth: 0
                },
                styles: {
                    fontSize: 8.5,
                    cellPadding: 4,
                    valign: 'middle',
                    lineColor: colors.border,
                    lineWidth: 0.1
                },
                columnStyles: {
                    0: { fontStyle: 'bold' }
                },
                alternateRowStyles: {
                    fillColor: colors.light
                },
                margin: { left: margin, right: margin },
                didDrawPage: (data) => {
                    // Footer Management
                    const pageCount = doc.internal.getNumberOfPages();
                    doc.setFontSize(8);
                    doc.setTextColor(...colors.slate);

                    // Disclaimer / Footer Text
                    const footerY = pageHeight - 10;
                    doc.setDrawColor(...colors.border);
                    doc.setLineWidth(0.1);
                    doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

                    doc.text(`SYSTÈME DE GESTION DE DONNÉES - FIRST LOVE CHURCH`, margin, footerY);
                    doc.text(`Rapport généré le: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`, pageWidth / 2, footerY, { align: 'center' });
                    doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber} sur ${pageCount}`, pageWidth - margin, footerY, { align: 'right' });
                }
            });
        }

        // --- Final Professional Touch: Signature Section (if it's the last page) ---
        const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : startY;
        if (finalY + 40 < pageHeight) {
            const sigY = finalY + 25;
            doc.setDrawColor(...colors.slate);
            doc.setLineWidth(0.5);

            // Signature Line 1
            doc.line(margin, sigY, margin + 60, sigY);
            doc.setFontSize(8);
            doc.text('Gouverneur / Responsable', margin, sigY + 5);

            // Signature Line 2
            doc.line(pageWidth - margin - 60, sigY, pageWidth - margin, sigY);
            doc.text('Cachet de l\'Église', pageWidth - margin - 60, sigY + 5);
        }

        doc.save(`${fileName || 'Rapport_FLC'}.pdf`);
    } catch (err) {
        console.error("Critical error in PDF Generation:", err);
        throw err;
    }
};
