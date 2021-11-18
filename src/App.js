import { useEffect, useRef, useState} from 'react';
import * as tt from '@tomtom-international/web-sdk-maps';
import Router from './Router';
import TTZoomControls from './TTZoomControls';
import TTPanControls from './TTPanControls';
import MarkerPopup from './MarkerPopup';
import Marker from './Marker';
import './App.css';
import '@tomtom-international/web-sdk-maps/dist/maps.css'
import '@tomtom-international/web-sdk-plugin-zoomcontrols/dist/ZoomControls.css'
import '@tomtom-international/web-sdk-plugin-pancontrols/dist/PanControls.css'

//https://www.youtube.com/watch?v=43jfFU4FJZo


const App = () => {
  const mapElement = useRef();
  const [map, setMap] = useState({});
  const [longitude, setLongitude] = useState(-0.112869);
  const [latitude, setLatitude] = useState(51.504);
  const [zoom, setZoom] = useState(14); 

  useEffect(() => {
    const origin = {
      lng: longitude,
      lat: latitude
    }

    let map = tt.map({
      key: process.env.REACT_APP_TOM_TOM_API_KEY,
      container: mapElement.current,
      stylesVisibility: {
        trafficIncidents: true,
        trafficFlow: true,
      },
      center: [longitude, latitude],
      zoom: zoom
    });

    new TTZoomControls({
      'map': map, 
      'options': {
        className: 'margin-left-30',
        animate: true // deafult = true
      },
      'position': 'top-left'
    });

    new TTPanControls({
      'map': map, 
      'options': {},
      'position': 'top-left'
    });


    map.addControl(new tt.FullscreenControl());

    setMap(map);

    const popupOffset = {
      bottom: [0, -25]
    };

    const html = 'Travel to <a id="newdestination" href="#">BP</a>';

    const markerPopup = new MarkerPopup({
     'options': {
      offset: popupOffset
    },
    'html': html
    });

    const marker = new Marker({
      map: map,
      longitude: longitude,
      latitude: latitude,
    });

    marker.setPopup(markerPopup);
    marker.togglePopup();
    marker.on('dragend', () => {
      const lngLat = marker.getLngLat();
      const mapzoom = map.getZoom();
      setLongitude(lngLat.lng);
      setLatitude(lngLat.lat);
      setZoom(mapzoom);
    });

    const newDestinationButton = document.getElementById('newdestination');
        
    newDestinationButton.addEventListener('click', (e) => {
      const customLocation = {
        lng: 19.040236,
        lat: 47.497913
      };

      setZoom(8); 
      myRouter.resetRoute();
      myRouter.newDeliveryRoute(customLocation);
    })

    const myRouter = Router({map, origin});

    map.on('click', (e) => {
      myRouter.newDeliveryRoute(e.lngLat);
    })

    return () => map.remove()
  }, [longitude, latitude, zoom])

  return (
    <>
    {map && <div className="app">
      <header className="App-header">
        <div className="search-bar">
          <h1>Where to?</h1>
          <input 
            type="text"
            id="longitude"
            className="longitude"
            placeholder="Set Longitude"
            onChange={(e) => {setLongitude(e.target.value)}}
          />

          <input 
            type="text"
            id="latitude"
            className="latitude"
            placeholder="Set Latitude"
            onChange={(e) => {setLatitude(e.target.value)}}
          />
        </div>
      </header>
      <div ref={mapElement} className="map">
      </div>
    </div>}
    </>
  );
}

export default App;
