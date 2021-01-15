# SecuroDrive
Securodrive is a driving assistant platform that is built to avoid road accidents due to sleepy drivers. This app assists the drivers by applying AI techniques to the live video stream of the driver and generating alerts when the driver appears to be yawning excessively or going in a drowsy state  And alert them when they are sleepy. It is a serverless microservice-driven web application hosted on AWS.

### YouTube Demo URL
https://youtu.be/vUbxQOmeNQc

### S3 Bucket URL
http://project-frontend-web.s3-website-us-east-1.amazonaws.com/

### Architecture
![architecture](https://user-images.githubusercontent.com/10784445/103189522-a07e7800-4892-11eb-8a93-869c92c98c79.png)

### AWS Services Used
-	Amazon Cognito: Utilized in implementing the user authentication, session management and service usage authorization.
-	Amazon Rekognition: Utilized in recognizing the faces of the  users in order to add another layer of security.
-	Amazon Kinesis Video Stream: Used in live streaming the video from the camera inside user’s vehicle for drowsiness detection
-	Amazon EC2: Hosts the artificial intelligence model for performing the drowsiness detection on the live stream video from the user’s vehicle
-	Elasticsearch: Stores the data logs generated from the AI analysis of the video stream in real-time
-	Kibana: Visualized interactive and realtime graph from the user data logs in Elasticsearch
-	Amazon Polly: Alerts the user with voice recommendations to ensure that the user is attentive
-	API Gateway: Two offering of the API Gateway have been utilized in the project
  -	REST API: Enables creation of all the essential APIs to enable data transfer between frontend and the backend of the web application
  -	Web Socket: Establishes bidirectional data flow for sending and receiving drowse alerts between EC2 server and the frontend.
-	SageMaker: Responsible for training the model on user video frames to supplant current models in existence in future.
-	AWS Lambda: Used to provide the serverless backend logic computation along with API Gateway
-	DynamoDB: Provides no-SQL data storage for information like users and trips

### API Endpoints
- /auth/register - POST - project_auth_register : Indexes profile photo to rekognition and stores other info to DynamoDB
- /auth/update - POST - project_auth_register : Updates the profile photo to rekognition and stores other info to DynamoDB
- /history/item - POST - project_history_item : Fetches the list of all the historic trips for the user
- /history/list - POST - project_history_list : Fetches the information about a particular trip
- /trip/recommendations - POST - project_get_recommendations : Fetches the rest stop recommendations on the basis of the user’s current GPS location
- /trip/route - POST - project_get_route : Fetches the GPS route between the start and destination locations
- /trip/start - POST - project_start_trip : Used to start the EC2 AI model job instance
- /trip/end - POST - project_terminate : Used to terminate the EC2 AI model job instance
- /trip/video - GET - hls_url : Generates a HLS URL for Live Kinesis Video Stream.

### Team Members
- Ankush Jain
- [Smit Sheth](https://github.com/SmitSheth)
- [Vishnu Thakral](https://github.com/vvthakral)
- [Darshan Arvind Solanki](https://github.com/Darshansol9)
