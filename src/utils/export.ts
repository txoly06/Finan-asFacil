import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { Transaction } from '../types';
import { formatCurrency, formatDate } from './format';

export const exportToPDF = (transactions: Transaction[], title: string = 'Relatório Financeiro') => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, 14, 30);

    const tableData = transactions.map(tx => [
        formatDate(tx.date),
        tx.description,
        tx.category,
        tx.type === 'receita' ? 'Receita' : 'Despesa',
        formatCurrency(tx.amount),
        tx.status
    ]);

    autoTable(doc, {
        head: [['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor', 'Status']],
        body: tableData,
        startY: 40,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 133, 244] }, // Blue color
    });

    doc.save(`relatorio_financeiro_${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportToExcel = (transactions: Transaction[]) => {
    const ws = XLSX.utils.json_to_sheet(transactions.map(tx => ({
        Data: formatDate(tx.date),
        Descrição: tx.description,
        Categoria: tx.category,
        Tipo: tx.type,
        Valor: tx.amount,
        Status: tx.status
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transações");

    XLSX.writeFile(wb, `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.xlsx`);
};
