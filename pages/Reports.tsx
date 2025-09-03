import React from 'react';
import Icon from '../components/Icon';
import type { translations } from '../utils/translations';
import useLocalStorage from '../hooks/useLocalStorage';
import { Product, Invoice } from '../types';
import { initialProducts, initialInvoices } from '../data/initialData';
import { amiriFontBase64 } from '../utils/amiriFont';

// Global declaration for CDN libraries
declare const xlsx: any;
declare const jspdf: any;

interface ReportsProps {
  t: (key: keyof typeof translations.en) => string;
}

const Reports: React.FC<ReportsProps> = ({ t }) => {
    const [products] = useLocalStorage<Product[]>('products', initialProducts);
    const [invoices] = useLocalStorage<Invoice[]>('invoices', initialInvoices);
    
    const exportToExcel = (data: Record<string, any>[], fileName: string) => {
        const ws = xlsx.utils.json_to_sheet(data);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, 'Sheet1');
        xlsx.writeFile(wb, `${fileName}.xlsx`);
    };

    const exportToPDF = (headers: string[], body: (string|number)[][], fileName: string, title: string) => {
        const { jsPDF } = jspdf;
        const doc = new jsPDF();

        // Add Amiri font for Arabic support
        doc.addFileToVFS("Amiri-Regular.ttf", amiriFontBase64);
        doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
        doc.setFont("Amiri");

        const pageWidth = doc.internal.pageSize.getWidth();
        
        doc.setFontSize(18);
        doc.text(title, pageWidth / 2, 20, { align: 'center' });

        (doc as any).autoTable({
            head: [headers],
            body: body,
            startY: 30,
            theme: 'grid',
            styles: {
                font: 'Amiri',
                halign: document.documentElement.dir === 'rtl' ? 'right' : 'left',
                cellPadding: 2,
                fontSize: 10,
            },
            headStyles: {
                fillColor: [37, 99, 235], // blue-600
                textColor: 255,
                fontStyle: 'bold',
            },
            didDrawPage: (data: any) => {
                // Footer
                const str = `Page ${doc.internal.getNumberOfPages()}`;
                doc.setFontSize(10);
                doc.text(str, data.settings.margin.left, doc.internal.pageSize.getHeight() - 10);
            }
        });

        doc.save(`${fileName}.pdf`);
    };

    const handleExportInventory = (type: 'Excel' | 'PDF') => {
        const reportTitle = t('inventoryReport');
        if (type === 'Excel') {
            const data = products.map(p => ({
                [t('productName')]: p.name,
                [t('sku')]: p.sku,
                [t('quantityInStock')]: p.quantity,
                [t('purchasePrice')]: p.purchasePrice,
                [t('salePrice')]: p.salePrice,
                'Total Value (Sale)': p.salePrice * p.quantity,
            }));
            exportToExcel(data, reportTitle);
        } else { // PDF
            const headers = [t('productName'), t('sku'), t('quantityInStock'), t('purchasePrice'), t('salePrice'), 'Total Value (Sale)'];
            const body = products.map(p => [
                p.name,
                p.sku,
                p.quantity,
                p.purchasePrice.toLocaleString(),
                p.salePrice.toLocaleString(),
                (p.salePrice * p.quantity).toLocaleString(),
            ]);
            exportToPDF(headers, body, reportTitle, reportTitle);
        }
    };
    
    const handleExportSales = (type: 'Excel' | 'PDF') => {
        const reportTitle = t('salesReport');
        if (type === 'Excel') {
            const data = invoices.map(i => ({
                [t('invoiceNumber')]: i.invoiceNumber,
                [t('customer')]: i.customerName,
                [t('date')]: i.date,
                [t('subtotal')]: i.subtotal,
                [t('vat')]: i.vat,
                [t('total')]: i.total,
            }));
            exportToExcel(data, reportTitle);
        } else { // PDF
            const headers = [t('invoiceNumber'), t('customer'), t('date'), t('subtotal'), t('vat'), t('total')];
            const body = invoices.map(i => [
                i.invoiceNumber,
                i.customerName,
                i.date,
                i.subtotal.toLocaleString(),
                i.vat.toLocaleString(),
                i.total.toLocaleString(),
            ]);
            exportToPDF(headers, body, reportTitle, reportTitle);
        }
    };

    return (
    <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">{t('reports')}</h1>

        <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-700">{t('inventoryReport')}</h2>
                <div className="space-x-2 rtl:space-x-reverse">
                    <button onClick={() => handleExportInventory('Excel')} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                        <Icon name="document-arrow-down" className="w-4 h-4" /> <span className="mx-1">{t('exportToExcel')}</span>
                    </button>
                    <button onClick={() => handleExportInventory('PDF')} className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                         <Icon name="document-arrow-down" className="w-4 h-4" /> <span className="mx-1">{t('exportToPDF')}</span>
                    </button>
                </div>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th className="px-6 py-3">{t('productName')}</th>
                        <th className="px-6 py-3">{t('sku')}</th>
                        <th className="px-6 py-3">{t('quantityInStock')}</th>
                        <th className="px-6 py-3">{t('purchasePrice')}</th>
                        <th className="px-6 py-3">{t('salePrice')}</th>
                        <th className="px-6 py-3">Total Value (Sale)</th>
                    </tr>
                    </thead>
                    <tbody>
                    {products.map(p => (
                        <tr key={p.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4">{p.name}</td>
                        <td className="px-6 py-4">{p.sku}</td>
                        <td className="px-6 py-4">{p.quantity}</td>
                        <td className="px-6 py-4">{p.purchasePrice.toLocaleString()} {t('egp')}</td>
                        <td className="px-6 py-4">{p.salePrice.toLocaleString()} {t('egp')}</td>
                        <td className="px-6 py-4">{(p.salePrice * p.quantity).toLocaleString()} {t('egp')}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>

        <div>
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-700">{t('salesReport')}</h2>
                <div className="space-x-2 rtl:space-x-reverse">
                    <button onClick={() => handleExportSales('Excel')} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                        <Icon name="document-arrow-down" className="w-4 h-4" /> <span className="mx-1">{t('exportToExcel')}</span>
                    </button>
                    <button onClick={() => handleExportSales('PDF')} className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                         <Icon name="document-arrow-down" className="w-4 h-4" /> <span className="mx-1">{t('exportToPDF')}</span>
                    </button>
                </div>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th className="px-6 py-3">{t('invoiceNumber')}</th>
                        <th className="px-6 py-3">{t('customer')}</th>
                        <th className="px-6 py-3">{t('date')}</th>
                        <th className="px-6 py-3">{t('subtotal')}</th>
                        <th className="px-6 py-3">{t('vat')}</th>
                        <th className="px-6 py-3">{t('total')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {invoices.map(i => (
                        <tr key={i.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4">{i.invoiceNumber}</td>
                        <td className="px-6 py-4">{i.customerName}</td>
                        <td className="px-6 py-4">{i.date}</td>
                        <td className="px-6 py-4">{i.subtotal.toLocaleString()} {t('egp')}</td>
                        <td className="px-6 py-4">{i.vat.toLocaleString()} {t('egp')}</td>
                        <td className="px-6 py-4">{i.total.toLocaleString()} {t('egp')}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default Reports;