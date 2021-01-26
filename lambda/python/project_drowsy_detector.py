import json
import boto3
import dlib
import cv2
import time
from scipy.spatial import distance
from imutils import face_utils
import imutils
import os
import numpy as np
import time
import datetime
import websocket
import json
import requests
import base64

try:
    import thread
except ImportError:
    import _thread as thread

import time


class webSocket:

    msg = ''
    @staticmethod
    def on_message(ws, message):
        print('Message ',message)

    @staticmethod
    def on_error(ws, error):
        print('Error ',error)

    @staticmethod
    def on_close(ws):
        print("### closed ###")

    @staticmethod
    def on_open(ws):

        def run(*args):
            print('Inside Run')
            ws.send(json.dumps({ "action": "onMessage", "message":webSocket.msg}))
            ws.close()
            print("thread terminating...")

        thread.start_new_thread(run, ())


class drowsyDetector:



    def __init__(self):


        self.flag = 0
        self.frame_check = 15
        self.eye_thresh = 0.22
        self.yawn_thres = 0.58

        self.lStart,self.lEnd = face_utils.FACIAL_LANDMARKS_68_IDXS["left_eye"]
        self.rStart,self.rEnd = face_utils.FACIAL_LANDMARKS_68_IDXS["right_eye"]
        self.mStart,self.mEnd = face_utils.FACIAL_LANDMARKS_68_IDXS["mouth"]

        self.detect = dlib.get_frontal_face_detector()
        self.predict = dlib.shape_predictor('/home/ec2-user/shapedetectorfile/shape_predictor_68_face_landmarks.dat')

        #es config
        self.severe_count = 0
        self.recommend_alert = 0
        self.region = 'us-east-1'
        self.service = 'es'
        self.host =  'https://search-kibana-test-hrgtvqtpirdohmbmrl5rxrfzua.us-east-1.es.amazonaws.com'
        self.headers = { "Content-Type": "application/json" }

    def write_frames_to_s3(self,frame,snap_ts,trip_id):

        s3 = boto3.client('s3')
        snap_time = str(snap_ts) #.split('.')[0]
        imageName = f'{snap_time}.jpeg'
        print('Image Name ',imageName)
        cv2.imwrite(imageName, frame)
        local_image = open('./'+imageName, 'rb')
        s3 = boto3.client('s3')
        s3.put_object(Bucket="project-frontend-web", Key = f'img/trips/{trip_id}/{imageName}', Body = local_image, ContentType= 'image/jpeg')
        os.remove(imageName)


    def ear_mar_graph(self,snap_time,ear,mouthEAR,trip_id,user_email):

        snap_ts = datetime.datetime.fromtimestamp(snap_time)
        snap_ts = snap_ts.strftime("%Y-%m-%d"'T'"%H:%M:%S")

        json_data = {}
        json_data['ear'] = ear
        json_data['mar'] = mouthEAR
        json_data['time'] = snap_ts
        json_data['trip_id'] = trip_id
        json_data['user_email'] = user_email

        url = f'{self.host}/user_email/_doc/'
        r = requests.post(url, json=json.loads(json.dumps(json_data)), headers=self.headers)

    def emit_drowsy_signal(self,snap_time,frame,trip_id,user_email):

        snap_ts = datetime.datetime.fromtimestamp(snap_time)
        snap_ts = snap_ts.strftime("%Y-%m-%d"'T'"%H:%M:%S")

        json_data = {}
        json_data['snap_time'] = snap_ts
        json_data['trip_id'] = trip_id
        json_data['user_email'] = user_email

        url = f'{self.host}/user_email/_doc/'
        r = requests.post(url, json=json.loads(json.dumps(json_data)), headers=self.headers)

        string_to_push = f"{trip_id}; {snap_ts}" #{journey_cords[index][0]}; {journey_cords[index][1]}"
        websocket.enableTrace(False)

        ws = websocket.WebSocketApp("wss://gddowyfaka.execute-api.us-east-1.amazonaws.com/dev",
                                  on_message = webSocket.on_message,
                                  on_error = webSocket.on_error,
                                  on_close = webSocket.on_close)

        webSocket.msg = 'Alert; '+str(string_to_push)
        if(self.severe_count % 3 == 0):
            print(webSocket.msg)
            self.write_frames_to_s3(frame,snap_ts,trip_id)
            ws.on_open = webSocket.on_open
            ws.run_forever()

    def eye_aspect_ratio(self,eye):

        A = distance.euclidean(eye[1], eye[5])
        B = distance.euclidean(eye[2], eye[4])
        C = distance.euclidean(eye[0], eye[3])
        ear = (A + B) / (2.0 * C)

        return ear

    def mouth_aspect_ratio(self,m):

        A = distance.euclidean(m[3],m[9])
        B = distance.euclidean(m[0],m[7])
        mar = A/B

        return mar


    def gencam(self,frames,user_email,trip_id):

        #res_dict = self.preloaded_es(trip_id,_id)

        for frame in frames:

            frame = imutils.resize(frame, width=450)
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            subjects = self.detect(gray, 0)

            for subject in subjects:

                shape = self.predict(gray, subject)
                shape = face_utils.shape_to_np(shape)  # converting to NumPy Array
                leftEye = shape[self.lStart:self.lEnd]
                rightEye = shape[self.rStart:self.rEnd]
                mouth = shape[self.mStart:self.mEnd]

                leftEAR = self.eye_aspect_ratio(leftEye)
                rightEAR = self.eye_aspect_ratio(rightEye)
                mouthEAR = self.mouth_aspect_ratio(mouth)

                ear = (leftEAR + rightEAR) / 2.0

                leftEyeHull = cv2.convexHull(leftEye)
                rightEyeHull = cv2.convexHull(rightEye)
                mouthHull = cv2.convexHull(mouth)

                cv2.drawContours(frame, [leftEyeHull], -1, (0, 255, 0), 1)
                cv2.drawContours(frame, [rightEyeHull], -1, (0, 255, 0), 1)
                cv2.drawContours(frame,[mouthHull],-1,(0,255,255),1)

                print('Eye ratio ',ear)
                print('Mouth Ratio ',mouthEAR)

                if ear <= self.eye_thresh or mouthEAR >= self.yawn_thres:
                    self.flag += 1

                    if self.flag >= self.frame_check:
                        cv2.putText(frame, "***********************ALERT!********************", (10, 30),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                        cv2.putText(frame, "*******************ALERT!*********************", (10, 325),
                                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)


                        #get the snap time for current frame
                        snap_time = time.time()
                        #print('Recommendedation count ',self.severe_count)
                        if(self.severe_count % 3 == 0):
                            self.flag = 0
                            #self.recommend_alert += 1
                            #print('------------------------------------------Alert Released for Recommendedation--------------------------------------------')
                            self.ear_mar_graph(snap_time,ear,mouthEAR,trip_id,user_email)
                            self.emit_drowsy_signal(snap_time,frame,trip_id,user_email)

                        else:
                            #print('-------------------Alert Detected but not send-----------------')
                            if(self.flag % 22 == 0):
                                severe_count += 1
                                self.ear_mar_graph(snap_time,ear,mouthEAR,trip_id,user_email)
                                self.emit_drowsy_signal(snap_time,frame,trip_id,user_email)

#dd = drowsyDetector()
#dd.gencam([],sys.argv[1],sys.argv[2]) #email,trip_id
                                                                                                    