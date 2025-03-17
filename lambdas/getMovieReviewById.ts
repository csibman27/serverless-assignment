import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

// Initialize DynamoDB client
const ddbDocClient = createDDbDocClient();

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  try {
    // Print Event
    console.log("Event: ", JSON.stringify(event));
    const pathParameters = event?.pathParameters;
    const movieId = pathParameters?.movieId
      ? parseInt(pathParameters.movieId)
      : undefined;

    // Check if movieId is provided
    if (!movieId) {
      return {
        statusCode: 400,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ Message: "Missing movie Id" }),
      };
    }

    // Query to fetch reviews for the specified movieId
    const commandOutput = await ddbDocClient.send(
      new QueryCommand({
        TableName: process.env.TABLE_NAME, // Table for reviews
        KeyConditionExpression: "movieId = :movieId",
        ExpressionAttributeValues: {
          ":movieId": movieId,
        },
      })
    );

    // Log service response
    console.log("QueryCommand response: ", commandOutput);

    if (!commandOutput.Items || commandOutput.Items.length === 0) {
      return {
        statusCode: 404,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          Message: "No reviews found for the specified movieId",
        }),
      };
    }

    const body = {
      data: commandOutput.Items,
    };

    // Return Response
    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    };
  } catch (error: any) {
    console.log("Error: ", JSON.stringify(error));
    return {
      statusCode: 500,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};

function createDDbDocClient() {
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
// import {
//   DynamoDBDocumentClient,
//   QueryCommand,
//   QueryCommandInput,
// } from "@aws-sdk/lib-dynamodb";

// // Initialize DynamoDB client
// const ddbDocClient = createDDbDocClient();

// export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
//   try {
//     // Print the event for debugging
//     console.log("Event: ", JSON.stringify(event));

//     if (!isValidQueryParams(queryParams)) {
//       return {
//         statusCode: 500,
//         headers: {
//           "content-type": "application/json",
//         },
//         body: JSON.stringify({
//           message: `Incorrect type. Must match Query parameters schema`,
//           schema: schema.definitions["MovieCastMemberQueryParams"],
//         }),
//       };
//     }

//     const movieId = queryParams.movieId;
//     let commandInput: QueryCommandInput = {
//       TableName: process.env.TABLE_NAME,
//     };

//     if ("reviewId" in queryParams) {
//       commandInput = {
//         ...commandInput,
//         IndexName: "contentIx",
//         KeyConditionExpression: "movieId = :m and begins_with(reviewId, :r) ",
//         ExpressionAttributeValues: {
//           ":m": movieId,
//           ":r": queryParams.reviewId,
//         },
//       };
//     } else if ("reviewerId" in queryParams) {
//       commandInput = {
//         ...commandInput,
//         KeyConditionExpression: "movieId = :m and begins_with(reviewerId, :rn) ",
//         ExpressionAttributeValues: {
//           ":m": movieId,
//           ":rn": queryParams.reviewerId,
//         },
//       };
//     } else {
//       commandInput = {
//         ...commandInput,
//         KeyConditionExpression: "movieId = :m",
//         ExpressionAttributeValues: {
//           ":m": movieId,
//         },
//       };
//     }

//     const commandOutput = await ddbDocClient.send(
//       new QueryCommand(commandInput)
//       );

//     // Return response with reviews
//     return {
//       statusCode: 200,
//       headers: {
//         "content-type": "application/json",
//       },
//       body: JSON.stringify({
//         data: commandOutput.Items,
//       }),
//     };
//   } catch (error: any) {
//     console.log("Error: ", JSON.stringify(error));
//     return {
//       statusCode: 500,
//       headers: {
//         "content-type": "application/json",
//       },
//       body: JSON.stringify({ error: "Internal Server Error" }),
//     };
//   }
// };

// // Function to create the DynamoDB Document Client
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
