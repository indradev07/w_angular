import { Injectable } from '@angular/core';
import * as FileSaver from 'file-saver';

@Injectable({
  providedIn: 'root',
})
export class FileDownloadService {
  
  downloadAsCSV(rows: any[], fileName: string = 'data.csv'): void {
    if (!rows || !rows.length) {
      console.error('No data to download');
      return;
    }

    const csvData = this.convertToCSV(rows);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    FileSaver.saveAs(blob, fileName);
  }

  private convertToCSV(rows: any[]): string {

    const csvArray: string[] = [];

    csvArray.push(Object.keys(rows[0]).map(this.escapeCsvValue).join(','));

    for (const row of rows) {
      csvArray.push(Object.values(row).map(this.escapeCsvValue).join(','));
    }

    return csvArray.join('\n');
  }

  private escapeCsvValue(value: any): string {
    if (typeof value === 'string') {
      value = value.replace(/"/g, '""'); 
    }
    return `"${value}"`; 
  }
}
