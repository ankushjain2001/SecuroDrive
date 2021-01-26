import json
import heapq
import math
import googlemaps
import pprint

API_KEY = ''

gmaps = googlemaps.Client(key=API_KEY)


def googlemaps(lat, lon):
    # Radius is in meters, curr lat+lon is ssrt to FIU, and only checks for open locations and gas stations
    places_result = gmaps.places_nearby(location=f'{lat}, {lon}', radius=4000, open_now=True,
                                        type='gas_station')

    return places_result

class Recommendations(object):
    
    
    def __init__(self,lat1,lon1):
        
        self.lat1 = lat1
        self.lon1 = lon1
        self.get_places = {}
        self.keywords_filter = ['gas_station','rest_area','food']
        self.topK = 10
        self.heap_builder = []
        heapq.heapify(self.heap_builder)
        
        
    
    def aerialDist(self,lat1,lon1,lat2,lon2):
    
        #print(lat1,lon1,lat2,lon2)
        
        r = 6371e3
        theta1 = lat1 * math.pi/180
        theta2 = lat2 * math.pi/180

        delta = (lon2 - lon1) * math.pi/180
        d = math.acos(math.sin(theta1) * math.sin(theta2)  + math.cos(theta1) * math.cos(theta2) * math.cos(delta)) * r
        
        #print('Distance ',d)
        return round(d/1e6,2)

    def garbageCleaner(self):
    
        self.heap_builder = []
        self.get_places = []

    def filterType(self,response,id_):

        proximity = 20 
        types = response['types']
        loc = response['geometry']['location']
        lat2,lon2 = float(loc['lat']),float(loc['lng'])
        name = response['name']
        open_cond = response['opening_hours']['open_now']

        json_obj = {'types':types,'loc':loc,'name':name,'open':open_cond}

        #print(response)
        #print('-'*10)
        if(open_cond):

            for key in self.keywords_filter:
                
                if(key in types):
                    distance = self.aerialDist(self.lat1,self.lon1,lat2,lon2)
                    heapq.heappush(self.heap_builder,(distance,id_))
                    self.get_places[id_] = json_obj
                        
                        
    def topRec(self):
        
        res = {}
        temp = self.topK
        
        while temp > 0:
            if(self.heap_builder):
                _,id_ = heapq.heappop(self.heap_builder)
                res[temp] = self.get_places[id_]
                temp -=1
            else:
                break
                
        self.garbageCleaner()
        
        return res
    
    def listify_dict(self, dic):
        lis = []
        doesExist = []
        for key, val in dic.items():
            if val['name'] not in doesExist:
                newItem = val.copy()
                newItem['rank'] = key
                lis.append(newItem)
                doesExist.append(newItem["name"])
                
        return lis
    
def lambda_handler(event, context):
    
    # lat, lon = 42.242236073960854,-83.67277773101898
    lat, lon = event['lat'], event['lon']
    res = googlemaps(lat,lon)['results']
    
    rc = Recommendations(lat,lon)
    for i in range(len(res)):
        rc.filterType(res[i],i)
           
    res = rc.topRec()
    res = rc.listify_dict(res)
    
    # TODO implement
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!'),
        'res' : res
    }
