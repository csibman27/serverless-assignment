import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { MovieReview } from "../shared/types";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";
import Ajv from "ajv";
import schema from "../shared/types.schema.json";

const ajv = new Ajv();
const isValidQueryParams = ajv.compile(
  schema.definitions["MovieReview"] || {}
);
 
const ddbDocClient = createDocumentClient();

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  try {
    console.log("[EVENT]", JSON.stringify(event));
    const queryParams = event.queryStringParameters;
    if (!queryParams) {
      return {
        statusCode: 500,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ message: "Missing query parameters" }),
      };
    }
    if (!isValidQueryParams(queryParams)) {
      return {
        statusCode: 500,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          message: `Incorrect type. Must match Query parameters schema`,
          schema: schema.definitions["MovieReview"],
        }),
      };
    }
    
    const reviewId = parseInt(queryParams.reviewId);
    let commandInput: QueryCommandInput = {
      TableName: process.env.TABLE_NAME,
    };
    if ("content" in queryParams) {
      commandInput = {
        ...commandInput,
        IndexName: "contentIx",
        KeyConditionExpression: "reviewId = :m and begins_with(content, :r) ",
        ExpressionAttributeValues: {
          ":m": reviewId,
          ":r": queryParams.content,
        },
      };
    } else if ("reviewerId" in queryParams) {
      commandInput = {
        ...commandInput,
        KeyConditionExpression: "reviewId = :m and begins_with(reviewerId, :a) ",
        ExpressionAttributeValues: {
          ":m": reviewId,
          ":a": queryParams.reviewerId,
        },
      };
    } else {
      commandInput = {
        ...commandInput,
        KeyConditionExpression: "reviewId = :m",
        ExpressionAttributeValues: {
          ":m": reviewId,
        },
      };
    }
    
    const commandOutput = await ddbDocClient.send(
      new QueryCommand(commandInput)
      );
      
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
