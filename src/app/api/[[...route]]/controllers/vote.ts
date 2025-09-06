import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { DEFAULT_SIGN_IN_PATH } from '@/routes';
import { voteSchema } from '@/schemas';
import { zValidator } from '@hono/zod-validator';
import { VotingPattern } from '@prisma/client';
import { Hono } from 'hono';
import { z } from 'zod';
import { getAnonymousVotes, hasReachedDailyVoteLimit, saveAnonymousVote } from '../utils/cookie-utils';

// Types for clarity and safety
type UserActivityMetrics = {
  isVerified: boolean;
  createdAt: Date;
  commentCount: number;
  photoCount: number;
  totalSpent: number;
  totalVotesGiven: number;
  lastActiveAt: Date;
  votingStreak: number;
};

type VoteWeightFactors = {
  accountAge: number;
  verificationStatus: number;
  activityScore: number;
};

type DemographicFactors = {
  genderMatch: number;
  ageDifference: number;
  votingPattern: number;
  ratingExtremity: number;
};

type UserDemographics = {
  gender: string | null;
  sexualOrientation: string | null;
  dateOfBirth: Date | null;
  averageRatingGiven: number | null;
};

type VotePattern = {
  averageRating: number;
  ratingDistribution: number[];
  extremeVotePercentage: number;
  consistencyScore: number;
};

type VotePatternAdjustment = {
  patternWeight: number;
  factors: {
    extremeVotingFactor: number;
    consistencyFactor: number;
    distributionFactor: number;
  };
};

type RatingDistribution = {
  [key: number]: number;
  weightedSum: number;
  totalWeight: number;
  count: number;
};

type RatingMetrics = {
  distribution: RatingDistribution;
  averageRating: number;
  weightedAverage: number;
};

// Constants for weight calculations
const WEIGHT_FACTORS = {
  NEW_ACCOUNT: 0.7,
  VERIFIED_USER: 1.2,
  ACTIVITY_MULTIPLIER: 0.001, // 0.1% per activity point
  MAX_ACTIVITY_BONUS: 0.5,
} as const;

// Constants for demographic weight calculations
const DEMOGRAPHIC_FACTORS = {
  SAME_GENDER_STRAIGHT: 0.5,
  AGE_GAP_THRESHOLD: 20,
  AGE_GAP_MULTIPLIER: 0.8,
  LOW_VOTER_BONUS: 1.2,
  HIGH_VOTER_PENALTY: 0.8,
  EXTREME_RATING_MULTIPLIER: 0.7,
} as const;

const PATTERN_FACTORS = {
  EXTREME_VOTE_THRESHOLD: 0.7,
  CONSISTENCY_THRESHOLD: 0.6,
  MIN_VOTES_REQUIRED: 5,
  EXTREME_PENALTY: 0.8,
  CONSISTENCY_BONUS: 1.2,
} as const;

// Constants for rating calculations
const RATING_CONSTANTS = {
  MIN_RATING: 1,
  MAX_RATING: 10,
  DISTRIBUTION_WINDOW_DAYS: 30,
} as const;

// Helper function to calculate activity-based weight
function calculateActivityScore(metrics: UserActivityMetrics): number {
  return (
    metrics.commentCount * 0.2 +
    metrics.photoCount * 0.3 +
    metrics.totalVotesGiven * 0.1 +
    Number(metrics.totalSpent) * 0.01 +
    metrics.votingStreak * 0.1
  );
}

// Helper function to calculate base weight with detailed factors
async function calculateBaseWeight(userId?: string): Promise<{
  weight: number;
  factors: VoteWeightFactors;
}> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      isVerified: true,
      createdAt: true,
      commentCount: true,
      photoCount: true,
      totalSpent: true,
      totalVotesGiven: true,
      lastActiveAt: true,
      votingStreak: true,
    },
  });

  if (!user) {
    return {
      weight: 1.0,
      factors: {
        accountAge: 1.0,
        verificationStatus: 1.0,
        activityScore: 0,
      },
    };
  }

  // Calculate account age factor
  const accountAgeInDays =
    (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  const accountAgeFactor =
    accountAgeInDays < 30 ? WEIGHT_FACTORS.NEW_ACCOUNT : 1.0;

  // Calculate verification status factor
  const verificationFactor = user.isVerified
    ? WEIGHT_FACTORS.VERIFIED_USER
    : 1.0;

  // Calculate activity score and factor
  const activityScore = calculateActivityScore(user);
  const activityFactor =
    1 +
    Math.min(
      activityScore * WEIGHT_FACTORS.ACTIVITY_MULTIPLIER,
      WEIGHT_FACTORS.MAX_ACTIVITY_BONUS
    );

  // Calculate final weight
  const finalWeight = accountAgeFactor * verificationFactor * activityFactor;

  return {
    weight: Number(finalWeight.toFixed(3)),
    factors: {
      accountAge: accountAgeFactor,
      verificationStatus: verificationFactor,
      activityScore: activityScore,
    },
  };
}

// Helper function for demographic weight calculation
async function calculateDemographicWeight(
  creatorId: string,
  rating: number,
  voterId?: string
): Promise<{
  weight: number;
  factors: DemographicFactors;
}> {
  const [voter, creator] = await Promise.all([
    db.user.findUnique({
      where: { id: voterId },
      select: {
        gender: true,
        sexualOrientation: true,
        dateOfBirth: true,
        averageRatingGiven: true,
      },
    }),
    db.user.findUnique({
      where: { id: creatorId },
      select: {
        gender: true,
        dateOfBirth: true,
      },
    }),
  ]);

  const factors: DemographicFactors = {
    genderMatch: 1.0,
    ageDifference: 1.0,
    votingPattern: 1.0,
    ratingExtremity: 1.0,
  };

  // If either user is not found, return a neutral weight
  if (!voter || !creator) {
    return {
      weight: 1.0,
      factors,
    };
  }

  // Gender-based adjustment
  if (
    voter.gender === creator.gender &&
    voter.sexualOrientation === 'STRAIGHT'
  ) {
    factors.genderMatch = DEMOGRAPHIC_FACTORS.SAME_GENDER_STRAIGHT;
  }

  // Age difference adjustment
  const ageDiff = calculateAgeDifference(
    voter.dateOfBirth,
    creator.dateOfBirth
  );
  if (ageDiff >= DEMOGRAPHIC_FACTORS.AGE_GAP_THRESHOLD) {
    factors.ageDifference = DEMOGRAPHIC_FACTORS.AGE_GAP_MULTIPLIER;
  }

  // Voting pattern adjustment
  if (voter.averageRatingGiven !== null) {
    if (voter.averageRatingGiven <= 5) {
      factors.votingPattern = DEMOGRAPHIC_FACTORS.LOW_VOTER_BONUS;
    } else if (voter.averageRatingGiven >= 9) {
      factors.votingPattern = DEMOGRAPHIC_FACTORS.HIGH_VOTER_PENALTY;
    }
  }

  // Extreme rating adjustment
  if (rating <= 2 || rating >= 9) {
    factors.ratingExtremity = DEMOGRAPHIC_FACTORS.EXTREME_RATING_MULTIPLIER;
  }

  // Calculate final demographic weight
  const finalWeight = Object.values(factors).reduce(
    (acc, factor) => acc * factor,
    1.0
  );

  return {
    weight: Number(finalWeight.toFixed(3)),
    factors,
  };
}

// Helper function to calculate age difference (in years)
function calculateAgeDifference(
  voterBirthDate: Date | null,
  creatorBirthDate: Date | null
): number {
  if (!voterBirthDate || !creatorBirthDate) {
    return 0;
  }
  return Math.abs(
    voterBirthDate.getFullYear() - creatorBirthDate.getFullYear()
  );
}

// Helper function for anonymous users’ weight
function calculateAnonymousWeight(): number {
  return 0.3; // Anonymous votes have significantly lower weight
}

async function checkDuplicateVote(
  postId: string,
  ipAddress: string,
  userId?: string
): Promise<{
  isDuplicate: boolean;
}> {
  const whereClause = {
    postId,
    OR: [{ ipAddress }, ...(userId ? [{ voterId: userId }] : [])],
  };

  const existingVote = await db.vote.findFirst({
    where: whereClause,
    select: { createdAt: true },
  });

  if (!existingVote) {
    return { isDuplicate: false };
  }

  return { isDuplicate: true };
}

// Helper function to analyze user's voting pattern
async function analyzeVotePattern(userId: string): Promise<VotePattern | null> {
  const recentVotes = await db.vote.findMany({
    where: {
      voterId: userId,
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      },
    },
    select: { rating: true },
    orderBy: { createdAt: 'desc' },
  });

  if (recentVotes.length < PATTERN_FACTORS.MIN_VOTES_REQUIRED) {
    return null;
  }

  const distribution = new Array(10).fill(0);
  recentVotes.forEach((vote) => {
    distribution[vote.rating - 1]++;
  });

  const averageRating =
    recentVotes.reduce((sum, vote) => sum + vote.rating, 0) /
    recentVotes.length;

  const extremeVotes = recentVotes.filter(
    (vote) => vote.rating <= 2 || vote.rating >= 9
  ).length;
  const extremeVotePercentage = extremeVotes / recentVotes.length;

  const standardDeviation = Math.sqrt(
    recentVotes.reduce(
      (sum, vote) => sum + Math.pow(vote.rating - averageRating, 2),
      0
    ) / recentVotes.length
  );
  const consistencyScore = 1 - standardDeviation / 3;

  return {
    averageRating,
    ratingDistribution: distribution,
    extremeVotePercentage,
    consistencyScore,
  };
}

// Helper function to calculate vote pattern adjustment
function calculatePatternAdjustment(
  pattern: VotePattern | null
): VotePatternAdjustment {
  if (!pattern) {
    return {
      patternWeight: 1.0,
      factors: {
        extremeVotingFactor: 1.0,
        consistencyFactor: 1.0,
        distributionFactor: 1.0,
      },
    };
  }

  const factors = {
    extremeVotingFactor:
      pattern.extremeVotePercentage > PATTERN_FACTORS.EXTREME_VOTE_THRESHOLD
        ? PATTERN_FACTORS.EXTREME_PENALTY
        : 1.0,
    consistencyFactor:
      pattern.consistencyScore > PATTERN_FACTORS.CONSISTENCY_THRESHOLD
        ? PATTERN_FACTORS.CONSISTENCY_BONUS
        : 1.0,
    distributionFactor: 1.0,
  };

  if (pattern.averageRating <= 5) {
    factors.distributionFactor = 1.2;
  } else if (pattern.averageRating >= 8) {
    factors.distributionFactor = 0.8;
  }

  const patternWeight = Object.values(factors).reduce(
    (acc, factor) => acc * factor,
    1.0
  );

  return {
    patternWeight: Number(patternWeight.toFixed(3)),
    factors,
  };
}

// Helper function to initialize rating distribution
function initializeRatingDistribution(): RatingDistribution {
  const distribution: RatingDistribution = {
    weightedSum: 0,
    totalWeight: 0,
    count: 0,
  };
  for (
    let i = RATING_CONSTANTS.MIN_RATING;
    i <= RATING_CONSTANTS.MAX_RATING;
    i++
  ) {
    distribution[i] = 0;
  }
  return distribution;
}

// Function to update rating distribution and calculate averages
async function updateRatingDistribution(
  postId: string,
  rating: number,
  weight: number
): Promise<RatingMetrics> {
  const post = await db.post.findUnique({
    where: { id: postId },
    select: { ratingDistribution: true },
  });

  const distribution: RatingDistribution =
    (post?.ratingDistribution as RatingDistribution) ||
    initializeRatingDistribution();

  distribution[rating] = (distribution[rating] || 0) + 1;
  distribution.count += 1;
  distribution.weightedSum += rating * weight;
  distribution.totalWeight += weight;

  const averageRating =
    distribution.count > 0
      ? Object.entries(distribution)
          .filter(([key]) => !isNaN(Number(key)))
          .reduce(
            (sum, [ratingKey, count]) => sum + Number(ratingKey) * count,
            0
          ) / distribution.count
      : 0;

  const weightedAverage =
    distribution.totalWeight > 0
      ? distribution.weightedSum / distribution.totalWeight
      : 0;

  await db.post.update({
    where: { id: postId },
    data: {
      ratingDistribution: distribution,
      averageRating: Number(averageRating.toFixed(2)),
      weightedRating: Number(weightedAverage.toFixed(2)),
    },
  });

  return {
    distribution,
    averageRating,
    weightedAverage,
  };
}

// Function to update user metrics after a vote
async function updateUserMetrics(
  userId: string,
  rating: number
): Promise<{
  averageRatingGiven: number;
  totalVotesGiven: number;
  votingPattern: string;
}> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      totalVotesGiven: true,
      averageRatingGiven: true,
      votingPattern: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const totalVotesGiven = user.totalVotesGiven + 1;
  const averageRatingGiven =
    ((user.averageRatingGiven || 0) * user.totalVotesGiven + rating) /
    totalVotesGiven;

  let votingPattern: VotingPattern = 'NEUTRAL';
  if (averageRatingGiven <= 5) {
    votingPattern = 'LOW_VOTER';
  } else if (averageRatingGiven >= 8) {
    votingPattern = 'HIGH_VOTER';
  }

  await db.user.update({
    where: { id: userId },
    data: {
      totalVotesGiven,
      averageRatingGiven: Number(averageRatingGiven.toFixed(2)),
      votingPattern: votingPattern,
      lastActiveAt: new Date(),
    },
  });

  return {
    averageRatingGiven: Number(averageRatingGiven.toFixed(2)),
    totalVotesGiven,
    votingPattern,
  };
}



// Function to log vote details
async function logVoteDetails(
  rating: number,
  weight: number,
  postId: string,
  voterId: string | null,
  ipAddress: string,
  voteContext: 'DIRECT' | 'REFERRAL',
  isOutlier: boolean,
  baseWeight: number,
  userWeight: number,
  contextWeight: number
): Promise<void> {
  await db.vote.create({
    data: {
      rating,
      weight,
      postId,
      voterId,
      ipAddress,
      voteContext,
      isOutlier,
      baseWeight,
      userWeight,
      contextWeight,
    },
  });
}

// Function to log user activity
async function logUserActivity(
  userId: string,
  actionType: string,
  details?: Record<string, unknown>
): Promise<void> {
  await db.userActivityLog.create({
    data: {
      userId,
      actionType,
      details: details ? JSON.parse(JSON.stringify(details)) : {},
    },
  });
}

const app = new Hono().post(
  '/:id',
  zValidator('param', z.object({ id: z.string().optional() })),
  zValidator('json', voteSchema),
  async (c) => {
    const { id } = c.req.valid('param');
    const { rating } = c.req.valid('json');
    const ipAddress = c.req.header('x-forwarded-for') || 'unknown';

    if (!id) {
      return c.json({ message: 'Post ID is required!' }, 400);
    }

    const user = await currentUser();

    // Check if anonymous user has reached daily vote limit
    if (!user && hasReachedDailyVoteLimit()) {
      return c.json(
        {
          message: 'Daily vote limit reached. Please sign in to continue voting.',
          redirectToSignIn: true,
          redirectUrl: DEFAULT_SIGN_IN_PATH,
        },
        403
      );
    }

    const post = await db.post.findUnique({
      where: { id },
      select: {
        id: true,
        creator: { select: { id: true } },
      },
    });

    if (!post) {
      return c.json({ message: 'Post not found!' }, 404);
    }

    if (user?.id === post.creator.id) {
      return c.json({ message: 'You cannot vote on your own post!' }, 403);
    }

    const { isDuplicate } = await checkDuplicateVote(id, ipAddress, user?.id);

    if (isDuplicate) {
      return c.json(
        {
          message: `You have already voted on this post!`,
        },
        429
      );
    }

    // Calculate vote weight and factors
    let finalWeight: number;
    let weightFactors: {
      baseWeight: number;
      demographicWeight?: number;
      patternWeight?: number;
      details?: Record<string, unknown>;
    };

    // For registered users, compute detailed weight factors
    if (user?.id) {
      const [baseWeightResult, demographicWeightResult] = await Promise.all([
        calculateBaseWeight(user.id),
        calculateDemographicWeight(post.creator.id, rating, user.id),
      ]);

      const votePattern = await analyzeVotePattern(user.id);
      const patternAdjustment = calculatePatternAdjustment(votePattern);

      finalWeight = Number(
        (
          baseWeightResult.weight *
          demographicWeightResult.weight *
          patternAdjustment.patternWeight
        ).toFixed(3)
      );

      weightFactors = {
        baseWeight: baseWeightResult.weight,
        demographicWeight: demographicWeightResult.weight,
        patternWeight: patternAdjustment.patternWeight,
        details: {
          base: baseWeightResult.factors,
          demographic: demographicWeightResult.factors,
          pattern: patternAdjustment.factors,
          votePattern: votePattern,
        },
      };
    } else {
      finalWeight = calculateAnonymousWeight();
      weightFactors = {
        baseWeight: finalWeight,
        details: { anonymous: true },
      };
    }

    // Log the vote details.
    // For this example, userWeight and contextWeight are defaulted to 1.0.
    await Promise.all([
      logVoteDetails(
        rating,
        finalWeight,
        post.id,
        user?.id || null,
        ipAddress,
        'DIRECT',
        false,
        weightFactors.baseWeight,
        1.0,
        1.0
      ),
      updateRatingDistribution(post.id, rating, finalWeight),
      user?.id ? updateUserMetrics(user.id, rating) : Promise.resolve(null),
    ]);

    if (user?.id) {
      // Track activity for authenticated users
      await logUserActivity(user.id, 'VOTE', {
        postId: post.id,
        rating,
        weight: finalWeight,
      });
    } else {
      // Track vote for anonymous users in cookies
      saveAnonymousVote(post.id);
    }

    return c.json({
      success: true,
      message: 'Vote submitted successfully!',
      weight: finalWeight,
      factors: weightFactors,
    });
  }
);

export default app;
