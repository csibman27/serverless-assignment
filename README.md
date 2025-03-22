## Enterprise Web Development module - Serverless REST Assignment.

__Name:__ Tibor Molnar

__Demo:__ https://youtu.be/4YqjZ0TGfjo

### Overview.

State briefly the content of this repository.

### App API endpoints.

[ Provide a bullet-point list of the API's endpoints (excluding the Auth API) you have successfully implemented - see the assignment specification as a guide.]
e.g.
+ GET /movies/reviews/[movieId] - Get all the reviews for the specified movie. The code for supporting optional query string that specifies a review ID or reviewer identity (email address), e.g. ?revieId=1234 or ?reviewerName=joe@gmail.com is left commented as could not retieve it over postman however the querystring was logeed in cloudwatch. I may have called it wrong way over postman.
+ POST /movies/reviews - add a movie review. Only authenticated users can post a review.
+ PUT /movies/{movieId}/reviews/{reviewId} - Update the text of a review.

### Features.


#### Restricted review updates

[Explain briefly your solution to this requirement - no code excerpts required]

Only authenticated users can perform POST and PUT requests, whereas GET requests are publicly accessible. In addition, only the originator of a review can update it.




