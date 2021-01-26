import json
import base64
import boto3 

dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3')
rek_client = boto3.client('rekognition')

def lambda_handler(event, context):
    # TODO implement
    # Event contains the JSON. Use the test button with the custom test case myTest. It has a valid base64 image
    bucket_name = 'project-frontend-web' 
    table = dynamodb.Table('project-users')
    
    img_data = event['image']
    email = event['email']
    name = event['name']
    phone_number = event['phone']
    
    key = 'img/users/' + email + '.jpeg'
    
    s3.put_object(Body=base64.b64decode(img_data), Bucket=bucket_name, Key=key) 
    
    image_url  = "https://project-frontend-web.s3.amazonaws.com/" + key
    
    ## Write code for facial recognition and update the face_id value
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
