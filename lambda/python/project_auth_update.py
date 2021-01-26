import json
import base64
import boto3 
from boto3.dynamodb.conditions import Key, Attr

dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3')
rek_client = boto3.client('rekognition')
def lambda_handler(event, context):
    # TODO implement
    
    # Event contains the JSON. Use the test button with the custom test case myTest. It has a valid base64 image
    # Since email is primary key, we might have to delete the existing record with the existing_email primary key and create a new record of the user
    
    bucket_name = 'project-frontend-web' 
    table = dynamodb.Table('project-users')
    
    email = event['email']
    name = event['name']
    phone_number = event['phone']
    
    if 'image' in event:
        img_data = event['image']
        key = 'img/users/' + email + '.jpeg'
        s3.put_object(Body=base64.b64decode(img_data), Bucket=bucket_name, Key=key)
        image_url  = "https://project-frontend-web.s3.amazonaws.com/" + key
        
        response = rek_client.index_faces(
            CollectionId='rekFaces',
            Image={
                'S3Object': {
                'Bucket': 'project-frontend-web',
                'Name': key
            }
            },
            DetectionAttributes=[
                'DEFAULT',
            ],
            MaxFaces=1,
            QualityFilter='AUTO'
        )
        try:
            face_id = response['FaceRecords'][0]['Face']['FaceId']
        except:
            return {
                'statusCode': 400,
                'body': json.dumps('Failed to find face, upload another image of self!'),
                'received_data': event
            }
    else:
        existing = table.get_item(Key={'email': email})
        print(existing['Item'])
        image_url  = existing['Item']['image_url']
        face_id  = existing['Item']['face_id']
    
    # Put item
    result = table.put_item(
        Item = {
                'email': email,
                'name': name,
                'phone_number': phone_number,
                'image_url' : image_url,
                'face_id' : face_id

        })
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!'),
        'received_data': event
    }