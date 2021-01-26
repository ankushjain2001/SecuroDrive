import json
import boto3
import base64
from datetime import datetime
import time
import numpy as np
import cv2
from drowsyDetect import *
import sys

frames = []
kvs_client = boto3.client('kinesisvideo')
s3 = boto3.client('s3')
rek_client=boto3.client('rekognition')
StreamARN = 'arn:aws:kinesisvideo:us-east-1:841622902378:stream/AmazonRekognition_user_live_feed/1608478703022'

def get_end_point(api_name):
    kvs_data_pt = kvs_client.get_data_endpoint(
            StreamARN=StreamARN,
            APIName=api_name
        )
    end_pt = kvs_data_pt['DataEndpoint']
    print(end_pt)
    return end_pt

#for darshan
def lambda_handler(email,trip_id):
    global frames
    #api_name = 'GET_MEDIA'
    #end_pt = get_end_point(api_name)
    end_pt = 'https://s-a7395519.kinesisvideo.us-east-1.amazonaws.com'

    #kvm = boto3.client('kinesis-video-archived-media',endpoint_url=end_pt)

    kvm = boto3.client('kinesis-video-media',endpoint_url=end_pt)

    response = kvm.get_media(
        StreamARN=StreamARN,
        StartSelector={
            'StartSelectorType': 'NOW'
        }
    )

    with open('stream.mp4', 'wb') as f:
        body = response['Payload'].read(1024*30)
        f.write(body)

    # Capture video
    vidcap = cv2.VideoCapture('stream.mp4')
    dd = drowsyDetector()
    while vidcap.isOpened():
        success, image = vidcap.read()
        if success or image:
            #img_name= str(time.time())+'.png'
            frames.append(image)
            #cv2.imwrite('ankush/'+img_name, image)
        else:
            break
    vidcap.release()
    if len(frames)>=25:
        frames = np.array(frames)
        dd.gencam(frames,email,trip_id)
        frames = []
    #print('Video capture released')

def lambda_handler1():
    api_name = 'GET_HLS_STREAMING_SESSION_URL'
    end_pt = get_end_point(api_name)
    kvm = boto3.client('kinesis-video-archived-media',endpoint_url = end_pt)
    response = kvm.get_hls_streaming_session_url(
        StreamARN=StreamARN,
        PlaybackMode='LIVE',
        ContainerFormat='FRAGMENTED_MP4',
        Expires=43200
    )
    print(response)

count = 0
while True:
    count +=1
    if count==1:
        print('====================')
        lambda_handler1()
        print('========================')
    if count==500:
        break
    email = sys.argv[1]
    trip_id = sys.argv[2]
    lambda_handler(email,trip_id)
