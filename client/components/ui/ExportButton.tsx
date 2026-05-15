'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ExportButtonProps {
    data: any[];
    filename?: string;
    sheetName?: string;
    label?: string;
    disabled?: boolean;
    className?: string; // Allow styling overrides
}

const ExportButton = ({ 
    data, 
    filename = 'export', 
    sheetName = 'Sheet1', 
    label = 'Export', 
    disabled,
    className
}: ExportButtonProps) => {
    
    const handleExport = () => {
        try {
            // Create worksheet
            const worksheet = XLSX.utils.json_to_sheet(data);
            
            // Auto-size columns (simple estimation)
            const colWidths = Object.keys(data[0] || {}).map(key => {
                return { wch: Math.max(key.length + 2, 15) }; // Default min width
            });
            worksheet['!cols'] = colWidths;

            // Create workbook and append sheet
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
            
            // Save file
            const timestamp = new Date().toISOString().split('T')[0];
            const fullFilename = `${filename}_${timestamp}.xlsx`;
            XLSX.writeFile(workbook, fullFilename);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export data. Please try again.');
        }
    };

    return (
        <Button 
            variant="outline" 
            size="default" 
            onClick={handleExport} 
            disabled={disabled || !data || data.length === 0}
            className={className}
        >
            <Download className="mr-2 h-4 w-4" />
            {label}
        </Button>
    );
};

export default ExportButton;
