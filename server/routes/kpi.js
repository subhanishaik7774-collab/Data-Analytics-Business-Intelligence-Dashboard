const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');

// Helper to determine status based on actual, warning threshold, and critical threshold
function determineStatus(actual, target, thresholdWarning, thresholdCritical, unit) {
  const val = parseFloat(actual);
  const wrn = thresholdWarning ? parseFloat(thresholdWarning) : null;
  const crit = thresholdCritical ? parseFloat(thresholdCritical) : null;

  // For metrics where higher is worse (like CAC)
  if (unit === '$' && target < actual && actual > wrn) {
    if (crit && val >= crit) return 'Critical';
    if (wrn && val >= wrn) return 'Warning';
    return 'On Track';
  }

  // standard case (higher is better, like MRR, conversion rate, DAU)
  if (crit !== null && val <= crit) return 'Critical';
  if (wrn !== null && val <= wrn) return 'Warning';
  return 'On Track';
}

// @route   GET api/kpis
// @desc    Get all KPIs
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const isDemo = db.isDemoMode();
    let kpis = [];

    if (!isDemo) {
      const result = await db.query('SELECT * FROM kpis ORDER BY id ASC');
      kpis = result.rows;
    } else {
      kpis = db.getStore().kpis;
    }

    res.json(kpis);
  } catch (err) {
    console.error('Fetch KPIs error:', err.message);
    res.status(500).json({ message: 'Server error fetching KPIs' });
  }
});

// @route   POST api/kpis
// @desc    Create a new KPI
// @access  Private
router.post('/', auth, async (req, res) => {
  const { name, target, actual, unit, thresholdWarning, thresholdCritical, description } = req.body;

  if (!name || target === undefined || actual === undefined) {
    return res.status(400).json({ message: 'Please provide name, target and actual values.' });
  }

  const computedStatus = determineStatus(actual, target, thresholdWarning, thresholdCritical, unit);

  try {
    const isDemo = db.isDemoMode();
    let newKpi = null;

    if (!isDemo) {
      const result = await db.query(
        `INSERT INTO kpis (name, target, actual, unit, status, threshold_warning, threshold_critical, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [name, target, actual, unit || '$', computedStatus, thresholdWarning || null, thresholdCritical || null, description || '']
      );
      newKpi = result.rows[0];
    } else {
      const store = db.getStore();
      const newId = store.kpis.length > 0 ? Math.max(...store.kpis.map(k => k.id)) + 1 : 1;
      newKpi = {
        id: newId,
        name,
        target: parseFloat(target),
        actual: parseFloat(actual),
        unit: unit || '$',
        status: computedStatus,
        threshold_warning: thresholdWarning ? parseFloat(thresholdWarning) : null,
        threshold_critical: thresholdCritical ? parseFloat(thresholdCritical) : null,
        description: description || '',
        created_at: new Date(),
        updated_at: new Date()
      };
      store.kpis.push(newKpi);
    }

    res.status(201).json(newKpi);
  } catch (err) {
    console.error('Create KPI error:', err.message);
    res.status(500).json({ message: 'Server error creating KPI' });
  }
});

// @route   PUT api/kpis/:id
// @desc    Update a KPI
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { name, target, actual, unit, thresholdWarning, thresholdCritical, description } = req.body;
  const kpiId = parseInt(req.params.id);

  if (!name || target === undefined || actual === undefined) {
    return res.status(400).json({ message: 'Please provide name, target and actual values.' });
  }

  const computedStatus = determineStatus(actual, target, thresholdWarning, thresholdCritical, unit);

  try {
    const isDemo = db.isDemoMode();
    let updatedKpi = null;

    if (!isDemo) {
      const result = await db.query(
        `UPDATE kpis 
         SET name = $1, target = $2, actual = $3, unit = $4, status = $5, 
             threshold_warning = $6, threshold_critical = $7, description = $8, updated_at = CURRENT_TIMESTAMP
         WHERE id = $9
         RETURNING *`,
        [name, target, actual, unit || '$', computedStatus, thresholdWarning || null, thresholdCritical || null, description || '', kpiId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'KPI not found' });
      }
      updatedKpi = result.rows[0];
    } else {
      const store = db.getStore();
      const idx = store.kpis.findIndex(k => k.id === kpiId);
      if (idx === -1) {
        return res.status(404).json({ message: 'KPI not found' });
      }
      
      updatedKpi = {
        ...store.kpis[idx],
        name,
        target: parseFloat(target),
        actual: parseFloat(actual),
        unit: unit || '$',
        status: computedStatus,
        threshold_warning: thresholdWarning ? parseFloat(thresholdWarning) : null,
        threshold_critical: thresholdCritical ? parseFloat(thresholdCritical) : null,
        description: description || '',
        updated_at: new Date()
      };
      store.kpis[idx] = updatedKpi;
    }

    res.json(updatedKpi);
  } catch (err) {
    console.error('Update KPI error:', err.message);
    res.status(500).json({ message: 'Server error updating KPI' });
  }
});

// @route   DELETE api/kpis/:id
// @desc    Delete a KPI
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  const kpiId = parseInt(req.params.id);

  try {
    const isDemo = db.isDemoMode();

    if (!isDemo) {
      const result = await db.query('DELETE FROM kpis WHERE id = $1 RETURNING id', [kpiId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'KPI not found' });
      }
    } else {
      const store = db.getStore();
      const idx = store.kpis.findIndex(k => k.id === kpiId);
      if (idx === -1) {
        return res.status(404).json({ message: 'KPI not found' });
      }
      store.kpis.splice(idx, 1);
    }

    res.json({ message: 'KPI successfully deleted', id: kpiId });
  } catch (err) {
    console.error('Delete KPI error:', err.message);
    res.status(500).json({ message: 'Server error deleting KPI' });
  }
});

module.exports = router;
