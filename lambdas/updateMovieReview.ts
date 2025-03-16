import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = createDDbDocClient();

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  try {
    console.log("[EVENT]", JSON.stringify(event));
    
    // extract movieId and reviewId from the URL parameters
    const movieId = parseInt(event.pathParameters?.movieId || '');
    const reviewId = parseInt(event.pathParameters?.reviewId || '');

    // console.log(movieId)
    // console.log(reviewId)
    
    // parse request body for updated content
    const body = event.body ? JSON.parse(event.body) : undefined;
    if (!body || !body.content) {
      return {
        statusCode: 400,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ message: "Missing 'content' field in request body" }),
      };
    }
    // console.log(body)

    // update the content in DB
    const updateParams = {
      TableName: process.env.TABLE_NAME,
      Key: {
        movieId: movieId,
        reviewId: reviewId,
      },
      UpdateExpression: "set content = :content",
      ExpressionAttributeValues: {
        ":content": body.content,
      },
      ReturnValues: "ALL_NEW",
    };

    // logging what is pushed to table
    // console.log(process.env.TABLE_NAME)
    // console.log(updateParams)

    const commandOutput = await ddbDocClient.send(new UpdateCommand(updateParams));
    
    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        message: "Movie review updated successfully",
        updatedItem: commandOutput.Attributes,
      }),
    };
  } catch (error: any) {
    console.log("[ERROR]", JSON.stringify(error));
    return {
      statusCode: 500,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ error: "Failed to update movie review", details: error.message }),
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