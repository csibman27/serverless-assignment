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
