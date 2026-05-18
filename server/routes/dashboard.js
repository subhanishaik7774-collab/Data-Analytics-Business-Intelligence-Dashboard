const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Helper to calculate aggregations in JavaScript (Demo Mode fallback)
function aggregateInMemory(datapoints) {
  const dailyMap = {};
  const segmentMap = {};
  const categoryMap = {};

  let totalRevenue = 0;
  let totalSales = 0;
  let totalSignups = 0;
  let totalConvRateSum = 0;
  let count = 0;

  datapoints.forEach(dp => {
    const rev = parseFloat(dp.revenue);
    const sal = parseInt(dp.sales);
    const sig = parseInt(dp.signups);
    const conv = parseFloat(dp.conversion_rate);
    const dateStr = new Date(dp.date).toISOString().split('T')[0];

    // Overall metrics
    totalRevenue += rev;
    totalSales += sal;
    totalSignups += sig;
    totalConvRateSum += conv;
    count++;

    // Daily aggregate
    if (!dailyMap[dateStr]) {
      dailyMap[dateStr] = { date: dateStr, revenue: 0, sales: 0, signups: 0, conversion_rate_sum: 0, count: 0 };
    }
    dailyMap[dateStr].revenue += rev;
    dailyMap[dateStr].sales += sal;
    dailyMap[dateStr].signups += sig;
    dailyMap[dateStr].conversion_rate_sum += conv;
    dailyMap[dateStr].count += 1;

    // Segment aggregate
    if (!segmentMap[dp.segment]) {
      segmentMap[dp.segment] = { segment: dp.segment, revenue: 0, sales: 0, signups: 0, conversion_rate_sum: 0, count: 0 };
    }
    segmentMap[dp.segment].revenue += rev;
    segmentMap[dp.segment].sales += sal;
    segmentMap[dp.segment].signups += sig;
    segmentMap[dp.segment].conversion_rate_sum += conv;
    segmentMap[dp.segment].count += 1;

    // Category aggregate
    if (!categoryMap[dp.category]) {
      categoryMap[dp.category] = { category: dp.category, revenue: 0, sales: 0, signups: 0, conversion_rate_sum: 0, count: 0 };
    }
    categoryMap[dp.category].revenue += rev;
    categoryMap[dp.category].sales += sal;
    categoryMap[dp.category].signups += sig;
    categoryMap[dp.category].conversion_rate_sum += conv;
    categoryMap[dp.category].count += 1;
  });

  const daily = Object.values(dailyMap)
    .map(d => ({
      date: d.date,
      revenue: parseFloat(d.revenue.toFixed(2)),
      sales: d.sales,
      signups: d.signups,
      conversionRate: parseFloat((d.conversion_rate_sum / d.count).toFixed(2))
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const segments = Object.values(segmentMap).map(s => ({
    segment: s.segment,
    revenue: parseFloat(s.revenue.toFixed(2)),
    sales: s.sales,
    signups: s.signups,
    conversionRate: parseFloat((s.conversion_rate_sum / s.count).toFixed(2))
  }));

  const categories = Object.values(categoryMap).map(c => ({
    category: c.category,
    revenue: parseFloat(c.revenue.toFixed(2)),
    sales: c.sales,
    signups: c.signups,
    conversionRate: parseFloat((c.conversion_rate_sum / c.count).toFixed(2))
  }));

  const summary = {
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    totalSales,
    totalSignups,
    avgConversionRate: count > 0 ? parseFloat((totalConvRateSum / count).toFixed(2)) : 0
  };

  return { summary, daily, segments, categories };
}

// @route   GET api/dashboard/analytics
// @desc    Get aggregated analytics data for dashboard charts and KPI summary
// @access  Private
router.get('/analytics', auth, async (req, res) => {
  try {
    const isDemo = db.isDemoMode();

    if (!isDemo) {
      // 1. Fetch KPI Summary metrics
      const summaryResult = await db.query(`
        SELECT 
          COALESCE(SUM(revenue), 0) as "totalRevenue",
          COALESCE(SUM(sales), 0) as "totalSales",
          COALESCE(SUM(signups), 0) as "totalSignups",
          COALESCE(ROUND(AVG(conversion_rate), 2), 0) as "avgConversionRate"
        FROM datapoints
      `);
      
      const summary = {
        totalRevenue: parseFloat(summaryResult.rows[0].totalRevenue),
        totalSales: parseInt(summaryResult.rows[0].totalSales),
        totalSignups: parseInt(summaryResult.rows[0].totalSignups),
        avgConversionRate: parseFloat(summaryResult.rows[0].avgConversionRate)
      };

      // 2. Fetch daily trends
      const dailyResult = await db.query(`
        SELECT 
          TO_CHAR(date, 'YYYY-MM-DD') as date,
          COALESCE(SUM(revenue), 0) as revenue,
          COALESCE(SUM(sales), 0) as sales,
          COALESCE(SUM(signups), 0) as signups,
          COALESCE(ROUND(AVG(conversion_rate), 2), 0) as "conversionRate"
        FROM datapoints
        GROUP BY date
        ORDER BY date ASC
      `);

      const daily = dailyResult.rows.map(row => ({
        date: row.date,
        revenue: parseFloat(row.revenue),
        sales: parseInt(row.sales),
        signups: parseInt(row.signups),
        conversionRate: parseFloat(row.conversionRate)
      }));

      // 3. Fetch segment summaries
      const segmentResult = await db.query(`
        SELECT 
          segment,
          COALESCE(SUM(revenue), 0) as revenue,
          COALESCE(SUM(sales), 0) as sales,
          COALESCE(SUM(signups), 0) as signups,
          COALESCE(ROUND(AVG(conversion_rate), 2), 0) as "conversionRate"
        FROM datapoints
        GROUP BY segment
      `);

      const segments = segmentResult.rows.map(row => ({
        segment: row.segment,
        revenue: parseFloat(row.revenue),
        sales: parseInt(row.sales),
        signups: parseInt(row.signups),
        conversionRate: parseFloat(row.conversionRate)
      }));

      // 4. Fetch category summaries
      const categoryResult = await db.query(`
        SELECT 
          category,
          COALESCE(SUM(revenue), 0) as revenue,
          COALESCE(SUM(sales), 0) as sales,
          COALESCE(SUM(signups), 0) as signups,
          COALESCE(ROUND(AVG(conversion_rate), 2), 0) as "conversionRate"
        FROM datapoints
        GROUP BY category
      `);

      const categories = categoryResult.rows.map(row => ({
        category: row.category,
        revenue: parseFloat(row.revenue),
        sales: parseInt(row.sales),
        signups: parseInt(row.signups),
        conversionRate: parseFloat(row.conversionRate)
      }));

      res.json({ summary, daily, segments, categories });
    } else {
      // Demo Mode - aggregate in-memory datapoints
      const datapoints = db.getStore().datapoints;
      const aggregatedData = aggregateInMemory(datapoints);
      res.json(aggregatedData);
    }
  } catch (err) {
    console.error('Analytics aggregation error:', err.message);
    res.status(500).json({ message: 'Server error aggregating metrics' });
  }
});

// @route   GET api/dashboard/datasets
// @desc    Get list of all imported datasets
// @access  Private
router.get('/datasets', auth, async (req, res) => {
  try {
    const isDemo = db.isDemoMode();
    let datasets = [];

    if (!isDemo) {
      const result = await db.query('SELECT * FROM datasets ORDER BY created_at DESC');
      datasets = result.rows;
    } else {
      datasets = db.getStore().datasets;
    }

    res.json(datasets);
  } catch (err) {
    console.error('Fetch datasets error:', err.message);
    res.status(500).json({ message: 'Server error fetching datasets list' });
  }
});

module.exports = router;
