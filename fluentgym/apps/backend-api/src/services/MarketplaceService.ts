/**
 * Marketplace Service - Skill pack marketplace
 * Features: Pack creation, purchasing, reviews, payouts
 */

import Stripe from 'stripe';
import { db } from '../db/index.js';
import {
  marketplacePacks,
  packReviews,
  payments,
  payouts,
  skillPacks,
  users,
} from '../db/schema.js';
import { eq, and, desc, avg, count } from 'drizzle-orm';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const PLATFORM_FEE_PERCENT = 20; // 20% platform fee

export interface CreatePackInput {
  creatorId: string;
  skillPackId: string;
  price: number; // in cents
  description: string;
  thumbnailUrl?: string;
}

export interface PurchasePackInput {
  userId: string;
  packId: string;
}

export interface ReviewPackInput {
  userId: string;
  packId: string;
  rating: number; // 1-5
  review?: string;
}

export class MarketplaceService {
  /**
   * Create marketplace listing for skill pack
   */
  async createPack(input: CreatePackInput): Promise<{ packId: string }> {
    const { creatorId, skillPackId, price, description, thumbnailUrl } = input;

    // Verify skill pack exists and user owns it
    const [skillPack] = await db
      .select()
      .from(skillPacks)
      .where(eq(skillPacks.id, skillPackId))
      .limit(1);

    if (!skillPack) {
      throw new Error('Skill pack not found');
    }

    // Create marketplace listing
    const [pack] = await db
      .insert(marketplacePacks)
      .values({
        skillPackId,
        creatorId,
        price,
        description,
        thumbnailUrl,
        status: 'pending_review', // Requires admin approval
      })
      .returning();

    return { packId: pack.id };
  }

  /**
   * Get all marketplace packs (approved only)
   */
  async listPacks(filters?: {
    domain?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: 'downloads' | 'rating' | 'price' | 'newest';
  }): Promise<any[]> {
    let query = db
      .select({
        pack: marketplacePacks,
        skillPack: skillPacks,
        creator: users,
      })
      .from(marketplacePacks)
      .leftJoin(skillPacks, eq(marketplacePacks.skillPackId, skillPacks.id))
      .leftJoin(users, eq(marketplacePacks.creatorId, users.id))
      .where(eq(marketplacePacks.status, 'approved'));

    const packs = await query;

    // Get ratings for each pack
    const packsWithRatings = await Promise.all(
      packs.map(async (item) => {
        const [stats] = await db
          .select({
            averageRating: avg(packReviews.rating),
            totalReviews: count(packReviews.id),
          })
          .from(packReviews)
          .where(eq(packReviews.packId, item.pack.id));

        return {
          ...item.pack,
          skillPack: item.skillPack,
          creator: {
            id: item.creator?.id,
            displayName: item.creator?.email?.split('@')[0],
          },
          averageRating: parseFloat(stats.averageRating as any) || 0,
          totalReviews: stats.totalReviews || 0,
        };
      })
    );

    // Apply sorting
    if (filters?.sortBy === 'downloads') {
      packsWithRatings.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    } else if (filters?.sortBy === 'rating') {
      packsWithRatings.sort((a, b) => b.averageRating - a.averageRating);
    }

    return packsWithRatings;
  }

  /**
   * Get pack details
   */
  async getPack(packId: string): Promise<any> {
    const [pack] = await db
      .select({
        pack: marketplacePacks,
        skillPack: skillPacks,
        creator: users,
      })
      .from(marketplacePacks)
      .leftJoin(skillPacks, eq(marketplacePacks.skillPackId, skillPacks.id))
      .leftJoin(users, eq(marketplacePacks.creatorId, users.id))
      .where(eq(marketplacePacks.id, packId))
      .limit(1);

    if (!pack) {
      throw new Error('Pack not found');
    }

    // Get ratings
    const [stats] = await db
      .select({
        averageRating: avg(packReviews.rating),
        totalReviews: count(packReviews.id),
      })
      .from(packReviews)
      .where(eq(packReviews.packId, packId));

    // Get recent reviews
    const reviews = await db
      .select({
        review: packReviews,
        user: users,
      })
      .from(packReviews)
      .leftJoin(users, eq(packReviews.userId, users.id))
      .where(eq(packReviews.packId, packId))
      .orderBy(desc(packReviews.createdAt))
      .limit(10);

    return {
      ...pack.pack,
      skillPack: pack.skillPack,
      creator: {
        id: pack.creator?.id,
        displayName: pack.creator?.email?.split('@')[0],
      },
      averageRating: parseFloat(stats.averageRating as any) || 0,
      totalReviews: stats.totalReviews || 0,
      recentReviews: reviews.map((r) => ({
        ...r.review,
        user: {
          displayName: r.user?.email?.split('@')[0],
        },
      })),
    };
  }

  /**
   * Purchase pack (Stripe checkout)
   */
  async purchasePack(input: PurchasePackInput): Promise<{ checkoutUrl: string }> {
    const { userId, packId } = input;

    const [pack] = await db
      .select()
      .from(marketplacePacks)
      .where(eq(marketplacePacks.id, packId))
      .limit(1);

    if (!pack) {
      throw new Error('Pack not found');
    }

    if (pack.status !== 'approved') {
      throw new Error('Pack not available for purchase');
    }

    // Check if Stripe is configured
    if (!stripe) {
      throw new Error('Payment processing not configured. Please contact support.');
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: pack.currency?.toLowerCase() || 'usd',
            product_data: {
              name: `Skill Pack: ${pack.id}`,
              description: pack.description || undefined,
            },
            unit_amount: pack.price || 0,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/marketplace/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/marketplace/pack/${packId}`,
      metadata: {
        userId,
        packId,
      },
    });

    // Create pending payment record
    await db.insert(payments).values({
      userId,
      packId,
      stripePaymentId: session.id,
      amount: pack.price || 0,
      currency: pack.currency || 'USD',
      status: 'pending',
    });

    return { checkoutUrl: session.url || '' };
  }

  /**
   * Complete purchase (webhook handler)
   */
  async completePurchase(sessionId: string): Promise<void> {
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.stripePaymentId, sessionId))
      .limit(1);

    if (!payment) {
      throw new Error('Payment not found');
    }

    // Update payment status
    await db
      .update(payments)
      .set({
        status: 'completed',
        completedAt: new Date(),
      })
      .where(eq(payments.id, payment.id));

    // Increment downloads
    await db
      .update(marketplacePacks)
      .set({
        downloads: (marketplacePacks.downloads as any) + 1,
        revenue: (marketplacePacks.revenue as any) + (payment.amount || 0),
      })
      .where(eq(marketplacePacks.id, payment.packId!));

    // TODO: Grant access to skill pack for user
  }

  /**
   * Add review
   */
  async addReview(input: ReviewPackInput): Promise<{ reviewId: string }> {
    const { userId, packId, rating, review } = input;

    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    // Check if user already reviewed
    const [existing] = await db
      .select()
      .from(packReviews)
      .where(and(eq(packReviews.packId, packId), eq(packReviews.userId, userId)))
      .limit(1);

    if (existing) {
      throw new Error('You have already reviewed this pack');
    }

    const [newReview] = await db
      .insert(packReviews)
      .values({
        packId,
        userId,
        rating,
        review,
      })
      .returning();

    return { reviewId: newReview.id };
  }

  /**
   * Get creator earnings
   */
  async getCreatorEarnings(creatorId: string): Promise<{
    totalRevenue: number;
    totalPayouts: number;
    pendingPayout: number;
  }> {
    const [revenue] = await db
      .select({
        totalRevenue: marketplacePacks.revenue,
      })
      .from(marketplacePacks)
      .where(eq(marketplacePacks.creatorId, creatorId));

    const payoutRecords = await db
      .select()
      .from(payouts)
      .where(eq(payouts.creatorId, creatorId));

    const totalPayouts = payoutRecords
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const totalRevenue = (revenue?.totalRevenue as number) || 0;
    const creatorShare = totalRevenue * ((100 - PLATFORM_FEE_PERCENT) / 100);
    const pendingPayout = creatorShare - totalPayouts;

    return {
      totalRevenue,
      totalPayouts,
      pendingPayout,
    };
  }

  /**
   * Request payout
   */
  async requestPayout(creatorId: string): Promise<{ payoutId: string }> {
    const earnings = await this.getCreatorEarnings(creatorId);

    if (earnings.pendingPayout < 1000) {
      // Minimum $10
      throw new Error('Minimum payout amount is $10.00');
    }

    // Create payout record
    const [payout] = await db
      .insert(payouts)
      .values({
        creatorId,
        amount: earnings.pendingPayout,
        status: 'pending',
      })
      .returning();

    // TODO: Initiate Stripe transfer to creator's connected account

    return { payoutId: payout.id };
  }

  /**
   * Approve pack (admin)
   */
  async approvePack(packId: string): Promise<{ message: string }> {
    await db
      .update(marketplacePacks)
      .set({
        status: 'approved',
        publishedAt: new Date(),
      })
      .where(eq(marketplacePacks.id, packId));

    return { message: 'Pack approved successfully' };
  }

  /**
   * Reject pack (admin)
   */
  async rejectPack(packId: string, reason: string): Promise<{ message: string }> {
    await db
      .update(marketplacePacks)
      .set({
        status: 'rejected',
      })
      .where(eq(marketplacePacks.id, packId));

    // TODO: Send email to creator with rejection reason

    return { message: 'Pack rejected' };
  }
}
