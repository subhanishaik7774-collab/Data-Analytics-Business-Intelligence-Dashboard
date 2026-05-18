const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Lightweight helper to parse CSV strings into JSON arrays robustly
function parseCSV(csvText) {
  const lines = csvText.split(/\r?\n/);
  if (lines.length < 2) return [];

  // Parse headers
  const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
  const results = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Split on commas but respect quoted fields
    const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
    const row = {};

    headers.forEach((header, index) => {
      let val = matches[index] ? matches[index].trim() : '';
      // Clean quotes
      val = val.replace(/^["']|["']$/g, '');
      row[header] = val;
    });

    results.push(row);
  }
  return results;
}

// @route   POST api/data/import
// @desc    Upload & import a CSV or JSON file containing datapoints
// @access  Private
router.post('/import', auth, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded. Please upload a valid CSV or JSON file.' });
  }

  const fileName = req.file.originalname;
  const fileSize = req.file.size;
  const isDemo = db.isDemoMode();

  try {
    let parsedData = [];
    const fileContent = req.file.buffer.toString('utf8');

    // 1. Parsing File Content
    if (fileName.endsWith('.csv')) {
      parsedData = parseCSV(fileContent);
    } else if (fileName.endsWith('.json')) {
      try {
        parsedData = JSON.parse(fileContent);
        if (!Array.isArray(parsedData)) {
          parsedData = [parsedData];
        }
      } catch (jsonErr) {
        return res.status(400).json({ message: 'Invalid JSON file structure: ' + jsonErr.message });
      }
    } else {
      return res.status(400).json({ message: 'Unsupported file format. Please upload CSV or JSON.' });
    }

    if (parsedData.length === 0) {
      return res.status(400).json({ message: 'No data records found in the uploaded file.' });
    }

    // 2. Formatting & Validation of items
    const validatedPoints = [];
    for (let i = 0; i < parsedData.length; i++) {
      const row = parsedData[i];
      
      // Standardize key headers
      const date = row.date || row.Date || row.DATE;
      const category = row.category || row.Category || row.CATEGORY || 'Software';
      const segment = row.segment || row.Segment || row.SEGMENT || 'Enterprise';
      const revenue = row.revenue || row.Revenue || row.REVENUE;
      const sales = row.sales || row.Sales || row.SALES;
      const signups = row.signups || row.Signups || row.SIGNUPS;
      const conversionRate = row.conversion_rate || row.conversionRate || row.ConversionRate || row.CONVERSION_RATE || 0;

      if (!date || revenue === undefined || sales === undefined || signups === undefined) {
        return res.status(400).json({ 
          message: `Validation Error on row ${i + 1}: Date, Revenue, Sales, and Signups are required fields.` 
        });
      }

      validatedPoints.push({
        date: new Date(date).toISOString().split('T')[0],
        category: category.trim(),
        segment: segment.trim(),
        revenue: parseFloat(revenue),
        sales: parseInt(sales),
        signups: parseInt(signups),
        conversion_rate: parseFloat(conversionRate)
      });
    }

    // 3. Saving Datasets & Datapoints
    let importedDataset = null;

    if (!isDemo) {
      // Run within a PostgreSQL Transaction
      await db.query('BEGIN');

      const dsResult = await db.query(
        `INSERT INTO datasets (name, file_name, file_size, row_count, user_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [fileName.replace(/\.[^/.]+$/, ""), fileName, fileSize, validatedPoints.length, req.user.id]
      );
      importedDataset = dsResult.rows[0];

      // Bulk Insert Datapoints
      for (const dp of validatedPoints) {
        await db.query(
          `INSERT INTO datapoints (dataset_id, date, category, segment, revenue, sales, signups, conversion_rate)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [importedDataset.id, dp.date, dp.category, dp.segment, dp.revenue, dp.sales, dp.signups, dp.conversion_rate]
        );
      }

      await db.query('COMMIT');
    } else {
      // Demo Mode In-Memory Saving
      const store = db.getStore();
      const newDatasetId = store.datasets.length > 0 ? Math.max(...store.datasets.map(d => d.id)) + 1 : 1;
      
      importedDataset = {
        id: newDatasetId,
        name: fileName.replace(/\.[^/.]+$/, ""),
        file_name: fileName,
        file_size: fileSize,
        row_count: validatedPoints.length,
        user_id: req.user.id,
        created_at: new Date()
      };
      
      store.datasets.push(importedDataset);

      let dpId = store.datapoints.length > 0 ? Math.max(...store.datapoints.map(d => d.id)) + 1 : 1;
      validatedPoints.forEach(dp => {
        store.datapoints.push({
          id: dpId++,
          dataset_id: importedDataset.id,
          date: dp.date,
          category: dp.category,
          segment: dp.segment,
          revenue: dp.revenue,
          sales: dp.sales,
          signups: dp.signups,
          conversion_rate: dp.conversion_rate
        });
      });
    }

    res.status(201).json({
      message: 'Data imported successfully!',
      dataset: importedDataset,
      importedRowsCount: validatedPoints.length
    });

  } catch (err) {
    if (!isDemo) {
      await db.query('ROLLBACK');
    }
    console.error('Import API error:', err.message);
    res.status(500).json({ message: 'Server error processing data import: ' + err.message });
  }
});

module.exports = router;
