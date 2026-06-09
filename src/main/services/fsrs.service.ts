import { FSRS, Rating, Card, State } from 'ts-fsrs';

export interface FlashcardState {
  dueDate: Date | string | null;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  nextInterval: number;
  reviewCount: number;
  lapseCount: number;
  state: string; // 'new' | 'learning' | 'review' | 'relearning' | 'mastered'
  lastReviewDate: Date | string | null;
}

export interface FSRSResult {
  card: Card;
  nextReviewDate: Date;
  interval: number;
  stability: number;
  difficulty: number;
  state: string;
  retrievability: number;
}

export class FSRSService {
  private fsrs: FSRS;

  constructor(targetRetention: number = 0.9) {
    this.fsrs = new FSRS({
      // FSRS-7 optimized parameters
      w: [
        0.4072, 1.1829, 3.1262, 15.4722, 7.2102, 0.5316, 1.0651, 0.0589,
        1.5330, 0.1544, 1.0070, 1.9395, 0.1100, 0.2900, 2.2700, 0.2500,
        2.9898, 0.5100, 0.4295
      ],
      request_retention: targetRetention,
      maximum_interval: 36500, // 100 years
      enable_fuzz: true,       // slightly randomize intervals to prevent review grouping
    });
  }

  private mapStateToFSRS(state: string): State {
    switch (state) {
      case 'learning': return State.Learning;
      case 'review': return State.Review;
      case 'relearning': return State.Relearning;
      case 'mastered': return State.Review; // FSRS ts-fsrs has New, Learning, Review, Relearning
      case 'new':
      default:
        return State.New;
    }
  }

  private mapStateFromFSRS(state: State): string {
    switch (state) {
      case State.Learning: return 'learning';
      case State.Review: return 'review';
      case State.Relearning: return 'relearning';
      case State.New:
      default:
        return 'new';
    }
  }

  // Update card scheduling state
  scheduleCard(
    card: FlashcardState,
    rating: 1 | 2 | 3 | 4, // 1=Again, 2=Hard, 3=Good, 4=Easy
    now: Date = new Date()
  ): FSRSResult {
    const fsrsCard: Card = {
      due: card.dueDate ? new Date(card.dueDate) : now,
      stability: card.stability || 0,
      difficulty: card.difficulty || 5,
      elapsed_days: card.elapsedDays || 0,
      scheduled_days: card.nextInterval || 0,
      reps: card.reviewCount || 0,
      lapses: card.lapseCount || 0,
      state: this.mapStateToFSRS(card.state),
      last_review: card.lastReviewDate ? new Date(card.lastReviewDate) : undefined,
      learning_steps: 0
    };

    const ratingMap = {
      1: Rating.Again,
      2: Rating.Hard,
      3: Rating.Good,
      4: Rating.Easy
    };

    const scheduling = this.fsrs.repeat(fsrsCard, now);
    const result = scheduling[ratingMap[rating]];

    // Determine if state is mastered based on stability
    let stateStr = this.mapStateFromFSRS(result.card.state);
    if (stateStr === 'review' && result.card.stability > 21) {
      stateStr = 'mastered';
    }

    return {
      card: result.card,
      nextReviewDate: result.card.due,
      interval: result.card.scheduled_days,
      stability: result.card.stability,
      difficulty: result.card.difficulty,
      state: stateStr,
      retrievability: this.fsrs.get_retrievability(result.card, now, false) as number
    };
  }

  // Calculate XP reward (delayed reviews yield 3x-5x XP)
  calculateXP(
    _card: FlashcardState,
    rating: number,
    daysSinceLastReview: number
  ): { xp: number; wasDelayed: boolean } {
    const baseXP = 5;
    const ratingMultiplier = { 1: 0, 2: 0.5, 3: 1, 4: 1.5 }[rating] ?? 1;

    let delayMultiplier = 1;
    let wasDelayed = false;

    if (daysSinceLastReview >= 30) {
      delayMultiplier = 5;
      wasDelayed = true;
    } else if (daysSinceLastReview >= 14) {
      delayMultiplier = 4;
      wasDelayed = true;
    } else if (daysSinceLastReview >= 7) {
      delayMultiplier = 3;
      wasDelayed = true;
    }

    const xp = Math.floor(baseXP * ratingMultiplier * delayMultiplier);
    return { xp, wasDelayed };
  }
}
