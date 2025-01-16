// loadData.js
import fs from 'fs';
import path from 'path';

const data = {};

const readJSON = () => {
  const files = [
    { key: 'balanceSheet', fileName: 'Balance_Sheet_2024.json' },
    { key: 'executiveSummary', fileName: 'Executive_Summary_2024.json' },
    { key: 'profitLoss', fileName: 'Profit_Loss_2024.json' },
  ];

  files.forEach(({ key, fileName }) => {
    const filePath = path.resolve('data', fileName);
    try {
      data[key] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
      console.error(`Error reading ${fileName}:`, error.message);
    }
  });
};

export const loadData = () => {
  readJSON();
  console.log('Data loaded:', data);
  return data; 
};
