import connectDB from '../../backend/src/config/db.js';
import recurringService from '../../backend/src/services/recurring.service.js';
import logger from '../../backend/src/utils/logger.js';

export default async function handler(req, res) {
  // Verify Vercel Cron request
  if (req.headers['x-vercel-cron'] !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    await connectDB();
    const results = await recurringService.processRecurringExpenses();
    
    logger.info('Cron job completed', { results });
    return res.status(200).json({
      success: true,
      message: 'Recurring expenses processed',
      data: results,
    });
  } catch (error) {
    logger.error('Cron job failed', { error: error.message });
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}