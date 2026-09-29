const { razorpayKeyId, razorpayKeySecret } = require('../../../../core/settings/platformCredentials.cjs');
const User = require('../../models/User');
const { validationResult } = require('express-validator');
const { createOrder } = require('../../services/razorpayService');
const { withTransaction, abort } = require('../../utils/withTransaction');
const { confirmGatewayPayment } = require('../../utils/confirmGatewayPayment');

/**
 * Get wallet balance
 */
const getWalletBalance = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('wallet');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        balance: user.wallet.balance || 0
      }
    });
  } catch (error) {
    console.error('Get wallet balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wallet balance. Please try again.'
    });
  }
};

/**
 * Add money to wallet
 */
const addMoneyToWallet = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const { amount } = req.body;

    // Validate amount
    if (amount < 100) {
      return res.status(400).json({
        success: false,
        message: 'Minimum amount to add is ₹100'
      });
    }

    // Create Razorpay order for wallet top-up
    const orderResult = await createOrder(
      amount,
      'INR',
      `WALLET_${userId}_${Date.now()}`,
      {
        userId: userId.toString(),
        type: 'wallet_topup'
      }
    );

    if (!orderResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create payment order'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment order created successfully',
      data: {
        orderId: orderResult.orderId,
        amount: orderResult.amount / 100,
        currency: orderResult.currency,
        key: razorpayKeyId()
      }
    });
  } catch (error) {
    console.error('Add money to wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order. Please try again.'
    });
  }
};

/**
 * Verify wallet top-up payment
 */
const verifyWalletTopup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // Verify signature
    const { verifyPayment } = require('../../services/razorpayService');
    const isValid = verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // The credited amount comes from Razorpay, NOT from req.body. The signature
    // only proves the order/payment ids are genuine — it says nothing about the
    // amount, so trusting the client's number let anyone pay ₹100 and claim ₹100000.
    const confirmed = await confirmGatewayPayment({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id
    });
    if (!confirmed.ok) {
      return res.status(confirmed.status).json({ success: false, message: confirmed.message });
    }

    // Dev-mock orders can't be confirmed against a gateway, so they fall back to
    // the requested amount. isDevMockOrder() is hard-disabled in production.
    const amount = confirmed.mock ? Number(req.body.amount) : confirmed.amount;
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payment amount' });
    }

    const Transaction = require('../../models/Transaction');

    // Credit + ledger row commit together, and the ledger row's unique-ish
    // referenceId check makes a replayed signature a no-op instead of free money.
    const outcome = await withTransaction(async (session) => {
      const alreadyCredited = await Transaction.findOne({
        referenceId: razorpay_payment_id,
        type: 'credit'
      }).session(session);

      if (alreadyCredited) abort({ alreadyCredited: true });

      const updated = await User.findByIdAndUpdate(
        userId,
        { $inc: { 'wallet.balance': amount } },
        { new: true, session }
      );

      if (!updated) abort({ notFound: true });

      const previousBalance = (updated.wallet.balance || 0) - amount;

      await Transaction.create([{
        userId: updated._id,
        type: 'credit',
        amount,
        status: 'completed',
        paymentMethod: 'razorpay', // or online
        description: 'Wallet Top-up',
        balanceBefore: previousBalance,
        balanceAfter: updated.wallet.balance,
        referenceId: razorpay_payment_id,
        metadata: {
          orderId: razorpay_order_id
        }
      }], { session });

      return { balance: updated.wallet.balance };
    });

    if (outcome.notFound) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    if (outcome.alreadyCredited) {
      return res.status(400).json({
        success: false,
        message: 'This payment has already been credited'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Money added to wallet successfully',
      data: {
        balance: outcome.balance
      }
    });
  } catch (error) {
    console.error('Verify wallet topup error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add money to wallet. Please try again.'
    });
  }
};

/**
 * Get wallet transaction history
 */
const getWalletTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const Transaction = require('../../models/Transaction');

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get transactions
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Transaction.countDocuments({ userId });

    // Format transactions
    const formattedTransactions = transactions.map(txn => ({
      id: txn._id,
      type: txn.type, // 'credit', 'debit', 'refund', 'penalty' etc.
      amount: txn.amount,
      description: txn.description,
      date: txn.createdAt,
      status: txn.status,
      balanceAfter: txn.balanceAfter
    }));

    res.status(200).json({
      success: true,
      data: formattedTransactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get wallet transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction history. Please try again.'
    });
  }
};

module.exports = {
  getWalletBalance,
  addMoneyToWallet,
  verifyWalletTopup,
  getWalletTransactions
};
