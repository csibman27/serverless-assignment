import { marshall } from "@aws-sdk/util-dynamodb";
import { Movie, MovieReview } from "./types";

type Entity = Movie | MovieReview;
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
