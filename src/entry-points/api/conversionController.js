import { conversionService } from '../../domain/services/conversionService.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const conversionController = {
  convert: asyncHandler(async (req, res) => {
    const { fromCurrency, toCurrency, value } = req.body;

    const result = await conversionService.convert(
      fromCurrency,
      toCurrency,
      value,
    );

    res.status(200).json({
      data: result,
      metadata: {
        timestamp: new Date(),
        apiVersion: '1.0.0',
      },
    });
  }),

  health: asyncHandler(async (req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date(),
      uptime: process.uptime(),
    });
  }),
};
