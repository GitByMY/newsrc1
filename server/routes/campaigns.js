const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');

// Error handler wrapper
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Get all campaigns
router.get('/', asyncHandler(async (req, res) => {
  console.log('GET /api/campaigns - Fetching all campaigns');
  try {
    const campaigns = await Campaign.find();
    console.log(`Found ${campaigns.length} campaigns`);
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Failed to fetch campaigns', details: error.message });
  }
}));

// Get a single campaign
router.get('/:id', asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) {
    return res.status(404).json({ message: 'Campaign not found' });
  }
  res.json(campaign);
}));

// Create a new campaign
router.post('/', asyncHandler(async (req, res) => {
  // Validate required fields
  const { name, audienceQuery } = req.body;
  if (!name || !audienceQuery) {
    return res.status(400).json({ message: 'Please provide name and audienceQuery' });
  }

  const campaign = new Campaign({
    name: req.body.name,
    audienceQuery: req.body.audienceQuery,
    summary: req.body.summary || '',
    audienceSize: req.body.audienceSize || 0,
    sentCount: req.body.sentCount || 0,
    failedCount: req.body.failedCount || 0,
    deliveryRatio: req.body.deliveryRatio || 0,
    status: req.body.status || 'in-progress'
  });

  const newCampaign = await campaign.save();
  res.status(201).json(newCampaign);
}));

// Update a campaign
router.put('/:id', asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) {
    return res.status(404).json({ message: 'Campaign not found' });
  }

  // Update fields if provided
  if (req.body.name) campaign.name = req.body.name;
  if (req.body.audienceQuery) campaign.audienceQuery = req.body.audienceQuery;
  if (req.body.summary !== undefined) campaign.summary = req.body.summary;
  if (req.body.audienceSize !== undefined) campaign.audienceSize = req.body.audienceSize;
  if (req.body.sentCount !== undefined) campaign.sentCount = req.body.sentCount;
  if (req.body.failedCount !== undefined) campaign.failedCount = req.body.failedCount;
  if (req.body.deliveryRatio !== undefined) campaign.deliveryRatio = req.body.deliveryRatio;
  if (req.body.status) campaign.status = req.body.status;

  const updatedCampaign = await campaign.save();
  res.json(updatedCampaign);
}));

// Delete a campaign
router.delete('/:id', asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) {
    return res.status(404).json({ message: 'Campaign not found' });
  }
  
  await campaign.deleteOne();
  res.json({ message: 'Campaign deleted' });
}));

module.exports = router; 