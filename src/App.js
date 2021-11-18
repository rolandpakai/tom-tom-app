import { useEffect, useRef, useState} from 'react';
import * as tt from '@tomtom-international/web-sdk-maps';
import Router from './Router';
import TTZoomControls from './TTZoomControls';
import TTPanControls from './TTPanControls';
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
      zoom: 14
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

    const addMarker = () => {
      const popupOffset = {
        bottom: [0, -25]
      }
      const popup = new tt.Popup({
        offset: popupOffset
      }).setHTML('You are Here!');

      const element = document.createElement('div');
      element.className = 'marker';

      const marker = new tt.Marker({
        draggable: true,
        element: element,
      })
      .setLngLat([longitude, latitude])
      .addTo(map);

      marker.on('dragend', () => {
        const lngLat = marker.getLngLat();
        setLongitude(lngLat.lng);
        setLatitude(lngLat.lat);
      })

      marker.setPopup(popup).togglePopup();

    }

    addMarker();

    const myRouter = Router({map, origin});

    map.on('click', (e) => {
      myRouter.newDeliveryRoute(e.lngLat);
    })

    return () => map.remove()
  }, [longitude, latitude])

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
