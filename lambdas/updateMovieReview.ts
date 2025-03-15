import { Handler } from "aws-lambda";
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = createDDbDocClient();

export const handler: Handler = async (event, context) => {
  try {
    console.log("Event: ", JSON.stringify(event));

    // Get the ID from the path parameters or the event
    const { id } = event.pathParameters || {}; // Ensure the id is passed as part of the URL

    if (!id) {
      return {
        statusCode: 400,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ Message: "ID parameter is required" }),
      };
    }

    const requestBody = JSON.parse(event.body || '{}');

    if (!requestBody || Object.keys(requestBody).length === 0) {
      return {
        statusCode: 400,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ Message: "Request body is empty or invalid" }),
      };
    }

    const updateExpression = buildUpdateExpression(requestBody);
    const expressionAttributeValues = buildExpressionAttributeValues(requestBody);

    // Update the DB
    const updateParams = {
      TableName: process.env.TABLE_NAME,
      Key: { id },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW", // updated item
    };

    const commandOutput = await ddbDocClient.send(new UpdateItemCommand(updateParams));

    if (!commandOutput.Attributes) {
      return {
        statusCode: 404,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ Message: "Item not found" }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ updatedItem: commandOutput.Attributes }),
    };
  } catch (error: any) {
    console.log(JSON.stringify(error));
    return {
      statusCode: 500,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ error }),
    };
  }
};

// build the update expression dynamically based on the body
function buildUpdateExpression(requestBody: Record<string, any>): string {
  const updateFields = Object.keys(requestBody).map((key) => `#${key} = :${key}`);
  return `SET ${updateFields.join(", ")}`;
}

// map values for the update expression
function buildExpressionAttributeValues(requestBody: Record<string, any>): Record<string, any> {
  const expressionAttributeValues: Record<string, any> = {};
  Object.keys(requestBody).forEach((key) => {
    expressionAttributeValues[`:${key}`] = requestBody[key];
  });
  return expressionAttributeValues;
}

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
