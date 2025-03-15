import * as cdk from "aws-cdk-lib";
import * as lambdanode from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as custom from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import { generateBatch } from "../shared/util";
import { movieReviews, movies } from "../seed/movies";
import * as apig from "aws-cdk-lib/aws-apigateway";


export class RestAPIStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Tables

    // const moviesTable = new dynamodb.Table(this, "MoviesTable", {
    //   billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    //   partitionKey: { name: "id", type: dynamodb.AttributeType.NUMBER },
    //   removalPolicy: cdk.RemovalPolicy.DESTROY,
    //   tableName: "Movies",
    // });

    const movieReviewsTable = new dynamodb.Table(this, "MovieReviewTable", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      partitionKey: { name: "movieId", type: dynamodb.AttributeType.NUMBER },
      sortKey: { name: "reviewerId", type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: "MovieReviews",
    });

    movieReviewsTable.addLocalSecondaryIndex({
      indexName: "contentIx",
      sortKey: { name: "content", type: dynamodb.AttributeType.STRING },
    });

    
    // Functions 
    const getMovieByIdFn = new lambdanode.NodejsFunction(
      this,
      "GetMovieByIdFn",
      {
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_22_X,
        entry: `${__dirname}/../lambdas/getMovieById.ts`,
        timeout: cdk.Duration.seconds(10),
        memorySize: 128,
        environment: {
          TABLE_NAME: movieReviewsTable.tableName,
          REGION: 'eu-west-1',
        },
      }
    );

    const getAllMovies = new lambdanode.NodejsFunction(
      this,
      "GetAllMovies",
      {
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_22_X,
        entry: `${__dirname}/../lambdas/getAllMovies.ts`,
        timeout: cdk.Duration.seconds(10),
        memorySize: 128,
        environment: {
          TABLE_NAME: movieReviewsTable.tableName,
          REGION: 'eu-west-1',
        },
      }
    );

    const getMovieReviewByIdFn = new lambdanode.NodejsFunction(
      this,
      "GetMovieReviewByIdFn",
      {
        architecture: lambda.Architecture.ARM_64,
        runtime: lambda.Runtime.NODEJS_22_X,
        entry: `${__dirname}/../lambdas/getMovieReviewById.ts`,
        timeout: cdk.Duration.seconds(10),
        memorySize: 128,
        environment: {
          TABLE_NAME: movieReviewsTable.tableName,
          REGION: 'eu-west-1',
        },
      }
    );

    const newMovieReviewFn = new lambdanode.NodejsFunction(this, "AddMovieReviewFn", {
      architecture: lambda.Architecture.ARM_64,
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: `${__dirname}/../lambdas/addMovieReview.ts`,
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
      environment: {
        TABLE_NAME: movieReviewsTable.tableName,
        REGION: "eu-west-1",
      },
    });

    const putMovieReviewFn = new lambdanode.NodejsFunction(this, "UpdateMovieReviewFn", {
      architecture: lambda.Architecture.ARM_64,
      runtime: lambda.Runtime.NODEJS_22_X,
      entry: `${__dirname}/../lambdas/updateMovieReview.ts`,
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
      environment: {
        TABLE_NAME: movieReviewsTable.tableName,
        REGION: "eu-west-1",
      },
    });

    
    // Permissions 
    movieReviewsTable.grantReadData(getMovieByIdFn)
    movieReviewsTable.grantReadData(getMovieReviewByIdFn)
    movieReviewsTable.grantReadData(getAllMovies)
    movieReviewsTable.grantReadWriteData(newMovieReviewFn)
    movieReviewsTable.grantReadWriteData(putMovieReviewFn)

    // create simple function url 
    const getMovieReviewByIdURL = getMovieReviewByIdFn.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ["*"],
 },
 });

     // Custom resources
     new custom.AwsCustomResource(this, "moviesddbInitData", {
      onCreate: {
        service: "DynamoDB",
        action: "batchWriteItem",
        parameters: {
          RequestItems: {
            [movieReviewsTable.tableName]: generateBatch(movies),
            [movieReviewsTable.tableName]: generateBatch(movieReviews),
          },
        },
        physicalResourceId: custom.PhysicalResourceId.of("moviesddbInitData"), //.of(Date.now().toString()),
      },
      policy: custom.AwsCustomResourcePolicy.fromSdkCalls({
        resources: [movieReviewsTable.tableArn],
      }),
    });
  
        
    // REST API 
    const api = new apig.RestApi(this, "RestAPI", {
      description: "serverlesss api",
      deployOptions: {
        stageName: "dev",
      },
      defaultCorsPreflightOptions: {
        allowHeaders: ["Content-Type", "X-Amz-Date"],
        allowMethods: ["OPTIONS", "GET", "POST", "PUT", "PATCH", "DELETE"],
        allowCredentials: true,
        allowOrigins: ["*"],
      },
    });

    // Gateway endpoints

    // Movie endpoint
    const moviesEndpoint = api.root.addResource("movies");
    moviesEndpoint.addMethod(
      "GET",
      new apig.LambdaIntegration(getAllMovies, { proxy: true })
    );
    // Movie ID endpoint
    const specificMovieEndpoint = moviesEndpoint.addResource("{movieId}");
    specificMovieEndpoint.addMethod(
      "GET",
      new apig.LambdaIntegration(getMovieByIdFn, { proxy: true })
    );
    // endpoint for movie review
    const movieReviewEndpoint = moviesEndpoint.addResource("reviews");

    movieReviewEndpoint.addMethod(
        "GET",
        new apig.LambdaIntegration(getMovieReviewByIdFn, { proxy: true })
    );
    // Review ID endpoint
    const specificMovieReviewEndpoint = movieReviewEndpoint.addResource("{movieId}");
    specificMovieReviewEndpoint.addMethod(
      "GET",
      new apig.LambdaIntegration(getMovieReviewByIdFn, { proxy: true })
    );
    // ADD moviereview endpoint
    movieReviewEndpoint.addMethod(
      "POST",
      new apig.LambdaIntegration(newMovieReviewFn, { proxy: true })
    );
    // PUT moviereview endpoint   PUT /movies/{movieId}/reviews/
    const specificReviewEndpoint = specificMovieEndpoint.addResource("reviews")

    specificReviewEndpoint.addMethod(
      "PUT",
      new apig.LambdaIntegration(putMovieReviewFn, { proxy: true })
    );
    // PUT /movies/{movieId}/reviews/{reviewId} - Update the text of a review.
    const specificReviewIdEndpoint = specificReviewEndpoint.addResource("{reviewId}")

    specificReviewIdEndpoint.addMethod(
      "PUT",
      new apig.LambdaIntegration(putMovieReviewFn, { proxy: true })
    );

    // Simple URL endpoint
    new cdk.CfnOutput(this, "Get Movie Cast Url", {
      value: getMovieReviewByIdURL.url,
 });
        
  }
}