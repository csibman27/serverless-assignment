export type MovieReview = {
  movieId: number;
  reviewId: number;
  reviewerId: string;
  reviewDate?: string;
  content?: string;
};

export type SignUpBody = {
  username: string;
  password: string;
  email: string;
};

export type ConfirmSignUpBody = {
  username: string;
  code: string;
};

export type SignInBody = {
  username: string;
  password: string;
};
