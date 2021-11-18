import { useEffect, useRef, useState} from 'react';
import * as tt from '@tomtom-international/web-sdk-maps';
import * as ttapi from '@tomtom-international/web-sdk-services';
import ZoomControls from '@tomtom-international/web-sdk-plugin-zoomcontrols';
import PanControls from '@tomtom-international/web-sdk-plugin-pancontrols';
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

  const convertToPoints = (lngLat) => {
    return {
      point: {
        latitude: lngLat.lat,
        longitude: lngLat.lng
      }
    }
  }

  const drawRoute = (geoJson, map) => {
    if (map.getLayer('route')) {
      map.removeLayer('route');
      map.removeSource('route');
    }

    map.addLayer({
      id: 'route',
      type: 'line',
      source: {
        type: 'geojson',
        data: geoJson
      },
      paint: {
        'line-color': 'red',
        'line-width': 6
      }
    })
  }

  const addDeliveryMarker = (lngLat, map) => {
    const element = document.createElement('div');
    element.className = 'marker-delivery';

    new tt.Marker({
      element: element
    })
    .setLngLat(lngLat)
    .addTo(map);
  }

  useEffect(() => {
    const origin = {
      lng: longitude,
      lat: latitude
    }
    const destinations = [];

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

    const ttZoomControls = new ZoomControls({
      className: 'margin-left-30',
      animate: true // deafult = true
    });
    const ttPanControls = new PanControls();

    map.addControl(new tt.FullscreenControl());

    map.addControl(ttZoomControls, 'top-left');
    map.addControl(ttPanControls, 'top-left');

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

    const sortDestinations = (locations) => {
      const pointsForDestinations = locations.map((destination) => {
        return convertToPoints(destination)
      });

      const callParameters = {
        key: process.env.REACT_APP_TOM_TOM_API_KEY,
        destinations: pointsForDestinations,
        origins: [convertToPoints(origin)]
      }

      return new Promise((resolve, reject) => {
        ttapi.services
        .matrixRouting(callParameters)
        .then((matrixAPIResults) => {
          const results = matrixAPIResults.matrix[0];
          const resultsArray = results.map((result, index) => {
            return {
              location: locations[index],
              drivingtime: result.response.routeSummary.travelTimeInSeconds
            }
          })

          resultsArray.sort((a, b) => {
            return a.trivingtime - b.drivingtime
          })

          const sortedLocations = resultsArray.map((result) => {
            return result.location
          })

          resolve(sortedLocations)
        })
      })
    }

    const recalculateRoutes = () => {
      sortDestinations(destinations).then((sorted) => {
        sorted.unshift(origin);

        ttapi.services.calculateRoute({
          key: process.env.REACT_APP_TOM_TOM_API_KEY,
          locations: sorted
        })
        .then((routeData) => {
          const geoJson = routeData.toGeoJson();
          drawRoute(geoJson, map);
        })
      })
    }

    map.on('click', (e) => {
      destinations.push(e.lngLat);
      addDeliveryMarker(e.lngLat, map);
      recalculateRoutes();
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
