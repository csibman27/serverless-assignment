// import Ajv from "ajv";
// import schema from "../shared/types.schema.json";
import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand, PutCommandInput } from "@aws-sdk/lib-dynamodb";


// const ajv = new Ajv();
// const isValidBodyParams = ajv.compile(schema.definitions["MovieReview"] || {});


const ddbDocClient = createDDbDocClient();

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  try {
    console.log("Event: ", JSON.stringify(event));

    // Get movieId and reviewId from the path parameters or the event
    const { movieId, reviewId, reviewerId, content } = event.pathParameters || {}; // Ensure the movieId is passed as part of the URL

    if (!movieId || !reviewId) {
      return {
        statusCode: 400,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ Message: "both ID parameters is required" }),
      };
    }

    // Parse the request body
    const body = event.body ? JSON.parse(event.body) : undefined;
    if (!body) {
      return {
        statusCode: 400, // Bad request if body is missing
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ message: "Missing request body" }),
      };
    }

    // if (!isValidBodyParams(body)) {
    //   return {
    //     statusCode: 500,
    //     headers: {
    //       "content-type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       message: `Incorrect type. Must match the MovieReview schema`,
    //       schema: schema.definitions["MovieReview"],
    //     }),
    //   };
    // }

    // Validate the content you want to update (e.g., content field)
    const { review } = body;
    if (!review) {
      return {
        statusCode: 400, // Bad request if the content content is missing
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ message: `Missing ${review}content to update` }),
      };
    }

    // Prepare the update parameters
    const updateParams = {
      TableName: process.env.TABLE_NAME,
      Key: { 
        movieId,
        reviewId,
      }, // Use movieId and reviewId to locate the item
      UpdateExpression: "set content = :content", // Only updating the content field
      ConditionExpression: "reviewerId = :reviewerId",
      ExpressionAttributeValues: {
        ":content": content,
        ":reviewerId": reviewerId,
      },
      ReturnValues: "ALL_NEW", // updated item
    };
    // logging
    console.log(updateParams)
    console.log(process.env.TABLE_NAME)

    // Execute the update command
    const commandOutput = await ddbDocClient.send(new UpdateCommand(updateParams));

    return {
      statusCode: 200, // OK response
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({
        message: "Review updated successfully",
        updatedReview: commandOutput.Attributes,
      }),
    };
  } catch (error: any) {
    console.log("Error:", JSON.stringify(error));

    return {
      statusCode: 500,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ error: error.message || "Internal server error" }),
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