import { marshall } from "@aws-sdk/util-dynamodb";
import { MovieReview } from "./types";

type Entity = MovieReview;
export const generateMovieItem = (entity: Entity) => {
  return {
    PutRequest: {
      Item: marshall(entity),
    },
  };
};

export const generateBatch = (data: Entity[]) => {
  return data.map((e) => {
    return generateMovieItem(e);
  });
};

export const generateRandomInt = (min: number, max: number): number => 
  Math.floor(Math.random() * (max - min + 1)) + min;
// console.log(generateRandomInt(10000, 99999));
