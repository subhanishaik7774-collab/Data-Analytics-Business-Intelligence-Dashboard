const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Helper to convert JSON arrays to CSV string
function convertToCSV(data) {
  if (data.length === 0) return '';
  
  const headers = ['date', 'category', 'segment', 'revenue', 'sales', 'signups', 'conversion_rate'];
  const csvRows = [headers.join(',')];

  data.forEach(row => {
    const values = headers.map(header => {
      let val = row[header];
      if (val instanceof Date) {
        val = val.toISOString().split('T')[0];
      }
      // Wrap strings in quotes if they contain commas
      if (typeof val === 'string' && val.includes(',')) {
        val = `"${val}"`;
      }
      return val === undefined || val === null ? '' : val;
    });
    csvRows.push(values.join(','));
  });

  return csvRows.join('\n');
}

// @route   GET api/reports/export
// @desc    Export aggregated datapoints with filters as CSV or JSON file
// @access  Private
router.get('/export', auth, async (req, res) => {
  const { startDate, endDate, category, segment, format } = req.query;
  const isDemo = db.isDemoMode();

  try {
    let rows = [];

    if (!isDemo) {
      // Build dynamic SQL query
      let queryText = 'SELECT date, category, segment, revenue, sales, signups, conversion_rate FROM datapoints WHERE 1=1';
      const queryParams = [];
      let paramIndex = 1;

      if (startDate) {
        queryText += ` AND date >= $${paramIndex++}`;
        queryParams.push(startDate);
      }
      if (endDate) {
        queryText += ` AND date <= $${paramIndex++}`;
        queryParams.push(endDate);
      }
      if (category && category !== 'All') {
        queryText += ` AND category = $${paramIndex++}`;
        queryParams.push(category);
      }
      if (segment && segment !== 'All') {
        queryText += ` AND segment = $${paramIndex++}`;
        queryParams.push(segment);
      }

      queryText += ' ORDER BY date DESC, revenue DESC';
      
      const result = await db.query(queryText, queryParams);
      rows = result.rows;
    } else {
      // Demo Mode filtering
      const store = db.getStore();
      rows = [...store.datapoints];

      if (startDate) {
        rows = rows.filter(r => new Date(r.date) >= new Date(startDate));
      }
      if (endDate) {
        rows = rows.filter(r => new Date(r.date) <= new Date(endDate));
      }
      if (category && category !== 'All') {
        rows = rows.filter(r => r.category.toLowerCase() === category.toLowerCase());
      }
      if (segment && segment !== 'All') {
        rows = rows.filter(r => r.segment.toLowerCase() === segment.toLowerCase());
      }

      rows.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // Serve file download based on format query param
    const fileFormat = (format || 'json').toLowerCase();
    
    if (fileFormat === 'csv') {
      const csvData = convertToCSV(rows);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=bi_dashboard_report.csv');
      return res.status(200).send(csvData);
    } else {
      // Default to JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=bi_dashboard_report.json');
      return res.json(rows);
    }

  } catch (err) {
    console.error('Export report error:', err.message);
    res.status(500).json({ message: 'Server error exporting report' });
  }
});

module.exports = router;
