import connectToDatabase from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  try {
    const { client, db } = await connectToDatabase();
    const campaignsCollection = db.collection('campaigns');
    
    // GET - Fetch all campaigns or a single campaign
    if (req.method === 'GET') {
      try {
        const { id } = req.query;
        
        if (id) {
          // Get a single campaign
          const campaign = await campaignsCollection.findOne({ _id: new ObjectId(id) });
          
          if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
          }
          
          return res.status(200).json(campaign);
        } else {
          // Get all campaigns
          console.log('Fetching campaigns from database...');
          const campaigns = await campaignsCollection.find({}).toArray();
          console.log(`Found ${campaigns.length} campaigns`);
          return res.status(200).json(campaigns);
        }
      } catch (err) {
        console.error('Error fetching campaigns:', err);
        return res.status(500).json({ error: 'Failed to fetch campaigns', details: err.message });
      }
    }
    
    // POST - Create a new campaign
    else if (req.method === 'POST') {
      try {
        const { name, audienceQuery } = req.body;
        
        if (!name || !audienceQuery) {
          return res.status(400).json({ message: 'Please provide name and audienceQuery' });
        }
        
        const campaign = {
          name: req.body.name,
          audienceQuery: req.body.audienceQuery,
          summary: req.body.summary || '',
          audienceSize: req.body.audienceSize || 0,
          sentCount: req.body.sentCount || 0,
          failedCount: req.body.failedCount || 0,
          deliveryRatio: req.body.deliveryRatio || 0,
          status: req.body.status || 'in-progress',
          createdAt: new Date()
        };
        
        const result = await campaignsCollection.insertOne(campaign);
        const insertedCampaign = await campaignsCollection.findOne({ _id: result.insertedId });
        
        return res.status(201).json(insertedCampaign);
      } catch (err) {
        console.error('Error creating campaign:', err);
        return res.status(500).json({ error: 'Failed to save campaign', details: err.message });
      }
    }
    
    // PUT - Update a campaign
    else if (req.method === 'PUT') {
      try {
        const { id } = req.query;
        
        if (!id) {
          return res.status(400).json({ message: 'Campaign ID is required' });
        }
        
        const campaign = await campaignsCollection.findOne({ _id: new ObjectId(id) });
        
        if (!campaign) {
          return res.status(404).json({ message: 'Campaign not found' });
        }
        
        const updateData = {};
        if (req.body.name) updateData.name = req.body.name;
        if (req.body.audienceQuery) updateData.audienceQuery = req.body.audienceQuery;
        if (req.body.summary !== undefined) updateData.summary = req.body.summary;
        if (req.body.audienceSize !== undefined) updateData.audienceSize = req.body.audienceSize;
        if (req.body.sentCount !== undefined) updateData.sentCount = req.body.sentCount;
        if (req.body.failedCount !== undefined) updateData.failedCount = req.body.failedCount;
        if (req.body.deliveryRatio !== undefined) updateData.deliveryRatio = req.body.deliveryRatio;
        if (req.body.status) updateData.status = req.body.status;
        
        await campaignsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );
        
        const updatedCampaign = await campaignsCollection.findOne({ _id: new ObjectId(id) });
        return res.status(200).json(updatedCampaign);
      } catch (err) {
        console.error('Error updating campaign:', err);
        return res.status(500).json({ error: 'Failed to update campaign', details: err.message });
      }
    }
    
    // DELETE - Delete a campaign
    else if (req.method === 'DELETE') {
      try {
        const { id } = req.query;
        
        if (!id) {
          return res.status(400).json({ message: 'Campaign ID is required' });
        }
        
        const campaign = await campaignsCollection.findOne({ _id: new ObjectId(id) });
        
        if (!campaign) {
          return res.status(404).json({ message: 'Campaign not found' });
        }
        
        await campaignsCollection.deleteOne({ _id: new ObjectId(id) });
        return res.status(200).json({ message: 'Campaign deleted' });
      } catch (err) {
        console.error('Error deleting campaign:', err);
        return res.status(500).json({ error: 'Failed to delete campaign', details: err.message });
      }
    }
    
    // Method not allowed
    else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (err) {
    console.error('Database connection error:', err);
    return res.status(500).json({ error: 'Database connection failed', details: err.message });
  }
} 