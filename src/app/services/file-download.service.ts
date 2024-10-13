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
    const header = Object.keys(rows[0]).join(',') + '\n';
    const body = rows
      .map(row => Object.values(row).map(value => `"${value}"`).join(','))
      .join('\n');
    return header + body;
  }
}
