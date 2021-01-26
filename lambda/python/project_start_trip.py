import json
import paramiko
import boto3
import uuid
from random import randint
import os
import sys
import random, string
import time
import datetime
import math
import cv2
import base64

sns_client = boto3.client('sns')
ec_client = boto3.client('ec2')
db_client = boto3.client('dynamodb')
s3_client = boto3.client('s3')
rek_client = boto3.client('rekognition')

# Rekognition
def person_search(email):
    vid = '/tmp/stream.mp4'
    end_pt = 'https://s-a7395519.kinesisvideo.us-east-1.amazonaws.com'
    kvm = boto3.client('kinesis-video-media',endpoint_url=end_pt)
    person_rekognized = False
    bucket = 'project-frontend-web'
    key = 'img'
    for i in range(1):
        response = kvm.get_media(
            StreamARN='arn:aws:kinesisvideo:us-east-1:841622902378:stream/AmazonRekognition_user_live_feed/1608478703022',
            StartSelector={
                'StartSelectorType': 'NOW'
            }
        )
        with open(vid, 'wb') as f:
            body = response['Payload'].read(1024*30)
            f.write(body)

        # Capture video
        vidcap = cv2.VideoCapture(vid)
        while vidcap.isOpened():
            success, image = vidcap.read()
            if success or image:
                img_name = str(time.time())+'.jpeg'
                cv2.imwrite('/tmp/'+img_name,image)
                s3_client.upload_file('/tmp/'+img_name, bucket, f'{key}/unauth_users/{img_name}')
                response = rek_client.compare_faces(
                    SourceImage={
                        'S3Object': {
                            'Bucket': bucket,
                            'Name': f'{key}/unauth_users/{img_name}'
                        }
                    },
                    TargetImage={
                        'S3Object': {
                            'Bucket': bucket,
                            'Name': f'{key}/users/{email}.jpeg'
                        }
                    },
                    SimilarityThreshold=85,
                    QualityFilter='AUTO'
                )
                s3_client.delete_object(Bucket=bucket, Key=f'{key}/unauth_users/{img_name}')
                if len(response['FaceMatches'])>0:
                    if int(response['FaceMatches'][0]['Similarity'])>90:
                        print('Accuracy: ', int(response['FaceMatches'][0]['Similarity']))
                        person_rekognized =True
                        break
            else:
                break
        vidcap.release()
        if person_rekognized==True:
            break
        else:
            s3_client.upload_file('/tmp/'+img_name, bucket, f'{key}/unauth_users/{img_name}')
            # Success - BUT WRONG PERSON
            return [person_rekognized, f'http://project-frontend-web.s3-website-us-east-1.amazonaws.com/img/unauth_users/{img_name}']
    # Success - RIGHT PERSON
    return [person_rekognized, None]


def lambda_handler(event, context):

    hist_table = 'project-trip-history'
    user_table = 'project-users'

    s3_client.download_file('project-ecpem','linux_ami1.pem', '/tmp/file.pem')
    
    # Data: trip data from frontend
    email_id = event['email']
    start = event['start']
    end = event['end']
    
    start_loc = str(start['loc'])
    start_lat = str(start['lat'])
    start_lon = str(start['lon'])
    
    end_loc = str(end['loc'])
    end_lat = str(end['lat'])
    end_lon = str(end['lon'])
    
    # Data: timestamp
    start_time = str(time.time())
    
    # --------- REKOGNITION ----------------------------------------------------
    
    # Add face recognition her
    # ... if person is rekognized then change the following flag to true... 
    # ... else make it false

    # person_rekognized = True
    try:
        # PERSON IS ALWAYS THERE - CAN BE RIGHT OR WRONG
        person_rekognized, img_url = person_search(event['email'])
    except:
        person_rekognized, img_url = False, "No person was detected in the camera."
        
    # --------------------------------------------------------------------------

    
    if person_rekognized:
        # Data: unique trip id
        trip_id = str(uuid.uuid4())
        try:
            response = db_client.get_item(TableName=hist_table,Key={'trip_id':{'S':trip_id}})
            while 'Item' in response:
                try:
                    trip_id = str(uuid.uuid4())
                    response = db_client.get_item(TableName=hist_table,Key={'trip_id':{'S':trip_id}})
                except:
                    pass
        except:
            pass
    
    
        
        # --------- EC2 --------------------------------------------------------
        # reading pem file and creating key object
    
        host = 'ec2-54-160-156-213.compute-1.amazonaws.com'
        user = 'ec2-user'
        key = paramiko.RSAKey.from_private_key_file("/tmp/file.pem")
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(hostname=host,username=user, pkey = key)
        print("Connected to :" + host)
        
        #command = execfile( "makefile.py")
        command = 'echo $$; exec ' + 'python3 stream_processor.py ' + email_id +' '+ trip_id
        stdin, stdout, stderr = ssh.exec_command(command)
        
        # Process id
        process_id = str(stdout.readline())[:-1]
        #-----------------------------------------------------------------------

        
        # Save data to history DB    
        response = db_client.put_item(TableName=hist_table, Item={
            "trip_id": {"S": trip_id},
            "email_id": {"S": email_id},
            "start_time": {"S": start_time},
            "start_loc": {"S": start_loc},
            "start_lat": {"S": start_lat},
            "start_lon": {"S": start_lon},
            "end_loc": {"S": end_loc},
            "end_lat": {"S": end_lat},
            "end_lon": {"S": end_lon},
            "process_id": {"S": str(process_id)}
        })
        
        
        # Response data for frontend
        response_data = {
            "trip_id": trip_id
        }
        
        
        return {
            'statusCode': 200,
            'body': 'Success from Lambda!',
            'response': response_data
        }
        
    else:
        response_data = {"error": "Unrecognized personnel using the service. The owner has been notified."}
        db_res = db_client.get_item(TableName=user_table, Key={'email':{'S':email_id}})
        if 'Item' in db_res:
            # Send SMS for unauthorized access
            sns_client.publish(
                PhoneNumber = str(db_res['Item']['phone_number']['S']),
                Message = "An unrecognized personnel is using your Securodrive vehicle. Please check your vehicle for any unauthorized access. " +img_url
            )
            
    
        return {
            'statusCode': 400,
            'body': json.dumps('Hello from Lambda!'),
            'response': response_data
        }
