import { Handler } from "aws-lambda";
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandInput,
  QueryCommandInput
} from "@aws-sdk/lib-dynamodb";

// Create the DynamoDB Document Client
const ddbDocClient = createDocumentClient();

export const handler: Handler = async (event, context) => {
  try {
    console.log("Event: ", JSON.stringify(event));

    const queryParams = event?.queryStringParameters;
    
    if (!queryParams) {
      return {
        statusCode: 500,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ message: "Missing query parameters" }),
      };
    }

    // Ensure that both movieId and reviewId are provided
    if (!queryParams.movieId) {
      return {
        statusCode: 500,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ message: "Missing movieId parameter" }),
      };
    }

    const movieId = parseInt(queryParams?.movieId);
    let commandInput: QueryCommandInput = {
      TableName: process.env.REVIEW_TABLE_NAME,
    };

    // qparams

    

    // Query the review from DynamoDB
    const commandOutput = await ddbDocClient.send(new QueryCommand(commandInput));

    // Query the review information
  const reviewCommandOutput = await ddbDocClient.send(
    new QueryCommand(commandInput)
  );

  // added
  let movieData: any = null;
    if (queryParams.movie) {
      // If the "movie" query parameter is provided, fetch additional movie info (title, genre ids, and overview)
      const movieCommandInput: GetCommandInput = {
        TableName: process.env.MOVIE_TABLE_NAME,
        Key: {
          movieId: movieId,
        },
      };

      // Fetch the movie information (title, genre ids, overview)
      const movieCommandOutput = await ddbDocClient.send(
        new GetCommand(movieCommandInput)
      );

      movieData = movieCommandOutput.Item;
    }

    // Combine the movie and review information
    const responseData: any = {
      cast: reviewCommandOutput.Items,
    };

    if (movieData) {
      responseData.movie = {
        title: movieData.title,
        genreIds: movieData.genreIds,
        overview: movieData.overview,
      };
    }


    // If review is found, return the review data
    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        data: commandOutput.Items,
      }),
    };

  } catch (error: any) {
    console.log("Error: ", JSON.stringify(error));
    return {
      statusCode: 500,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
};

// Helper function to create the DynamoDB Document Client
function createDocumentClient() {
  const ddbClient = new DynamoDBClient({ region: process.env.REGION });
  const marshallOptions = {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  };
  const unmarshallOptions = {
    wrapNumbers: false,
  };
  const translateConfig = { marshallOptions, unmarshallOptions };
  return DynamoDBDocumentClient.from(ddbClient, translateConfig);
}






// import { APIGatewayProxyHandlerV2 } from "aws-lambda";
// import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
// import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";


// const ddbDocClient = createDDbDocClient();

// export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
//   try {
//     // Print Event
//     console.log("Event: ", JSON.stringify(event));

//     const pathParameters = event?.pathParameters;
//     const reviewId = pathParameters?.reviewId ? parseInt(pathParameters.reviewId) : undefined;

//     if (!reviewId) {
//       return {
//         statusCode: 404,
//         headers: {
//           "content-type": "application/json",
//         },
//         body: JSON.stringify({ Message: "Missing review Id" }),
//       };
//     }

//     const commandOutput = await ddbDocClient.send(
//       new GetCommand({
//         TableName: process.env.REVIEW_TABLE_NAME,
//         Key: { id: reviewId },
//       })
//     );
//     // log
//     console.log("GetCommand response: ", commandOutput);
    
//     if (!commandOutput.Item) {
//       return {
//         statusCode: 404,
//         headers: {
//           "content-type": "application/json",
//         },
//         body: JSON.stringify({ Message: "Invalid review Id" }),
//       };
//     }
//     const body = {
//       data: commandOutput.Item,
//     };

//     // Return Response
//     return {
//       statusCode: 200,
//       headers: {
//         "content-type": "application/json",
//       },
//       body: JSON.stringify(body),
//     };
//   } catch (error: any) {
//     console.log(JSON.stringify(error));
//     return {
//       statusCode: 500,
//       headers: {
//         "content-type": "application/json",
//       },
//       body: JSON.stringify({ error }),
//     };
//   }
// };

// function createDDbDocClient() {
//   const ddbClient = new DynamoDBClient({ region: process.env.REGION });
//   const marshallOptions = {
//     convertEmptyValues: true,
//     removeUndefinedValues: true,
//     convertClassInstanceToMap: true,
//   };
//   const unmarshallOptions = {
//     wrapNumbers: false,
//   };
//   const translateConfig = { marshallOptions, unmarshallOptions };
//   return DynamoDBDocumentClient.from(ddbClient, translateConfig);
// }
