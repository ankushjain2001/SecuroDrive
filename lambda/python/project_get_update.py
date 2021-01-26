import sys
import json
import math
import boto3

import pprint
import googlemaps
from datetime import datetime
from urllib.parse import urlencode
from collections import OrderedDict
from googlemaps.convert import decode_polyline, encode_polyline
import requests

db_client = boto3.client('dynamodb')
hist_table = 'project-trip-history'

API_KEY = 'AIzaSyCMMRTbLQhUV8YxM51V43pY-byhKc_AtDs'


gmaps = googlemaps.Client(key=API_KEY)


def estimate_time(dp_item,time):
    
    lo = 0
    hi = len(dp_time) - 1
    
    while lo <= hi:
        
        mid = lo + (hi-lo)//2
        
        if(dp_time[mid] == time):
            return mid
            
        elif(dp_time[mid] > time):
            hi = mid - 1
        
        else:
            lo = mid + 1
    
    if(lo == len(dp_time)):
        return lo - 1
    
    else:
        return lo
        
        
def get_time_and_distance(route_json, distance = False):
    
    if not distance:
        time_list = [0] * len(route_json['routes'][0]['legs'][0]['steps'])
        for i in range(len(route_json['routes'][0]['legs'][0]['steps'])):
            time_list[i] = (route_json['routes'][0]['legs'][0]['steps'][i]['duration']['value'])
        return time_list
    else:
        distance_and_time = [0] * len(route_json['routes'][0]['legs'][0]['steps'])
        for i in range(len(route_json['routes'][0]['legs'][0]['steps'])):
            distance_and_time[i] = (route_json['routes'][0]['legs'][0]['steps'][i]['distance']['value'],route_json['routes'][0]['legs'][0]['steps'][i]['duration']['value'])
        return distance_and_time
        
def get_lat_long_from_address(address,data_type = 'json'): 
    
    endpoint = f"https://maps.googleapis.com/maps/api/geocode/{data_type}"
    params = {'address': address,
                'key' : API_KEY}
                
    url_params = urlencode(params)
    url = f'{endpoint}?{url_params}'
    r = requests.get(url)
    
    if r.status_code not in range(200,299):
        return {}
        
    latlng = {}
    try:
        latlng = r.json()['results'][0]['geometry']['location']
    except:
        pass
    
    return float(latlng.get('lat')),float(latlng.get('lng'))

def get_route_lat_long(API_KEY, start_lat, start_long,
                       end_lat, end_long,
                       data_type='json'):

    endpoint = f"https://maps.googleapis.com/maps/api/directions/{data_type}"
    params = {'origin': f'{start_lat},{start_long}',
              'key': API_KEY,
              'destination': f'{end_lat}, {end_long}',
              'mode': 'driving',
              'sensor': 'false'}
    url_params = urlencode(params)
    url = f"{endpoint}?{url_params}"

    r = requests.get(url)
    if r.status_code not in range(200,299):
        return {}
    return r.json()

def get_lat_long_from_route(route_json):
    journey_coords = [0] * len(route_json['routes'][0]['legs'][0]['steps'])
    for i in range(len(route_json['routes'][0]['legs'][0]['steps'])):
        journey_coords[i] = (route_json['routes'][0]['legs'][0]['steps'][i]['end_location']['lat'],route_json['routes'][0]['legs'][0]['steps'][i]['end_location']['lng'])
    
    return journey_coords

def address_mapper(start_address, end_address, custom):
    if custom:
        start_lat,start_long = start_address['lat'], start_address['lng']
        end_lat,end_long = end_address['lat'], end_address['lng']
    else:
        address = start_address
        start_lat,start_long = get_lat_long_from_address(address)
        #print(start_lat,start_long)
    
        end_address = end_address
        end_lat,end_long = get_lat_long_from_address(end_address)
        #print(end_lat,end_long)
    
    route_json = get_route_lat_long(API_KEY, start_lat, start_long,
                    end_lat, end_long)

    time_list = get_time_and_distance(route_json, distance = False)
    # print(f'(Time)\n{time_list}')
    
    journey_coords = get_lat_long_from_route(route_json)
    # print(f'(Latitude, Longitude)\n{journey_coords}')
    
    return time_list, journey_coords
    
    
    
def lambda_handler(event, context):
    
    if event['custom']:
        response = {}
        start_lat_lon = event['start']
        end_lat_lon = event['end']
        _, response['route_lat_lon'] = address_mapper(start_lat_lon, end_lat_lon, True)
        
        # TODO implement
        return {
            'statusCode': 200,
            'body': json.dumps('Hello from Lambda!'),
            'res' : response
        }
    else:
        trip_id = event['trip_id']
        response = db_client.get_item(TableName=hist_table,Key={'trip_id':{'S':trip_id}})
        if 'Item' in response:
            response = response['Item']
            
            start_address = response['start_loc']
            end_address = response['end_loc']
            response['route_time'], response['route_lat_lon'] = address_mapper(start_address, end_address, False)
            
            # TODO implement
            return {
                'statusCode': 200,
                'body': json.dumps('Hello from Lambda!'),
                'res' : response
            }
        else:
            return {
                'statusCode': 400,
                'body': json.dumps('Hello from Lambda!'),
                'res' : {'error': 'Trip ID not found. Something went wrong in trip creation.'}
            }
