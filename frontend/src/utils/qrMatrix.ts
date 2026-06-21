import QRCode from 'qrcode';

export function createQrMatrix(value: string): boolean[][] {
  const { modules } = QRCode.create(value, { errorCorrectionLevel: 'M' });
  const data = Array.from(modules.data);
  const moduleSize = modules.size;
  const rows: boolean[][] = [];
  for (let y = 0; y < moduleSize; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < moduleSize; x++) {
      row.push(Boolean(data[y * moduleSize + x]));
    }
    rows.push(row);
  }
  return rows;
}
