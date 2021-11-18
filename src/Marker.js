import * as tt from '@tomtom-international/web-sdk-maps';

export default class Marker {

    constructor({map, longitude, latitude}) {
        this.map = map;
        this.longitude = longitude;
        this.latitude = latitude;
    
        const element = document.createElement('div');
        element.className = 'marker';
  
        const marker = new tt.Marker({
          draggable: true,
          element: element,
        });
        
        marker.setLngLat([longitude, latitude]);
        marker.addTo(map);

        this.marker = marker;

        return marker;
    }
}