import { MovieReview} from '../shared/types'
import { generateRandomInt } from '../shared/util';

export const movieReviews: MovieReview[] = [
  {
    movieId: 466420,
    reviewId: generateRandomInt(10000, 99999),
    reviewerId: 'alice@example.com',
    reviewDate: '2025-01-15',
    content: 'Great movie, really enjoyed the acting and storyline!',
  },
  {
    movieId: 930564,
    reviewId: generateRandomInt(10000, 99999),
    reviewerId: 'bob@example.com',
    reviewDate: '2025-01-17',
    content: 'The plot was a bit predictable, but the effects were stunning.',
  },
  {
    movieId: 872585,
    reviewId: generateRandomInt(10000, 99999),
    reviewerId: 'charlie@example.com',
    reviewDate: '2025-01-18',
    content: 'Could have been better. The pacing was off and some characters felt underdeveloped.',
  },
  {
    movieId: 798141,
    reviewId: generateRandomInt(10000, 99999),
    reviewerId: 'bron@example.com',
    reviewDate: '2025-01-18',
    content: 'It was good overall.',
  },
  {
    movieId: 798141,
    reviewId: 48422,
    reviewerId: "emerald.jones@example.com",
    reviewDate: "2025-01-19",
    content: "An amazing experience, totally worth it."
  },
  {
    movieId: 798141,
    reviewId: 65483,
    reviewerId: "chris.martin@example.com",
    reviewDate: "2025-01-20",
    content: "It was good overall."
  },
  {
    movieId: 798141,
    reviewId: 92347,
    reviewerId: "amy.smith@example.com",
    reviewDate: "2025-01-21",
    content: "Quite entertaining, but a little too long."
  },
  {
    movieId: 798141,
    reviewId: 38495,
    reviewerId: "john.doe@example.com",
    reviewDate: "2025-01-22",
    content: "The storyline was quite predictable."
  },
  {
    movieId: 798141,
    reviewId: 56021,
    reviewerId: "susan.brown@example.com",
    reviewDate: "2025-01-23",
    content: "Really enjoyed the cinematography!"
  },
  {
    movieId: 798141,
    reviewId: 71028,
    reviewerId: "lisa.white@example.com",
    reviewDate: "2025-01-24",
    content: "Could have used a bit more character development."
  },
  {
    movieId: 798141,
    reviewId: 87415,
    reviewerId: "mike.jones@example.com",
    reviewDate: "2025-01-25",
    content: "It was fantastic, I couldn't look away."
  },
  {
    movieId: 798141,
    reviewId: 23894,
    reviewerId: "lucy.green@example.com",
    reviewDate: "2025-01-26",
    content: "Pretty decent film, but some slow moments."
  },
  {
    movieId: 798141,
    reviewId: 52176,
    reviewerId: "david.perez@example.com",
    reviewDate: "2025-01-27",
    content: "A great movie for fans of the genre."
  },
  {
    movieId: 798141,
    reviewId: 14530,
    reviewerId: "ellen.miller@example.com",
    reviewDate: "2025-01-28",
    content: "Loved it! Definitely recommend watching."
  }
  
];


