import * as tt from '@tomtom-international/web-sdk-maps';
import * as ttapi from '@tomtom-international/web-sdk-services';

const Router = ({map, origin}) => {

    const destinations = [];

    const convertToPoints = (lngLat) => {
        return {
          point: {
            latitude: lngLat.lat,
            longitude: lngLat.lng
          }
        }
    }

    const addDeliveryMarker = (lngLat) => {
        const element = document.createElement('div');
        element.className = 'marker-delivery';
    
        new tt.Marker({
          element: element
        })
        .setLngLat(lngLat)
        .addTo(map);
    }

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

    const drawRoute = (geoJson) => {
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

    const recalculateRoutes = () => {
        sortDestinations(destinations).then((sorted) => {
          sorted.unshift(origin);
  
          ttapi.services.calculateRoute({
            key: process.env.REACT_APP_TOM_TOM_API_KEY,
            locations: sorted
          })
          .then((routeData) => {
            const geoJson = routeData.toGeoJson();
            drawRoute(geoJson);
          })
        })
    }

    const newDeliveryRoute = (lngLat) => {
        destinations.push(lngLat);
        addDeliveryMarker(lngLat);
        recalculateRoutes();
    }

    return {
        newDeliveryRoute: newDeliveryRoute,
    }

}

export default Router;