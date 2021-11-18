import * as tt from '@tomtom-international/web-sdk-maps';
import * as ttapi from '@tomtom-international/web-sdk-services';

const Router = ({map, origin}) => {

    const destinations = [];
    const markers = [];

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
    
        const deliveryMarker = new tt.Marker({
          element: element
        });
        deliveryMarker.setLngLat(lngLat)
        deliveryMarker.addTo(map);

        markers.push(deliveryMarker);
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
        removeRoute();
    
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
        
        return recalculateRoutes();
    }

    const removeRoute = () => {
      if (map.getLayer('route')) {
        map.removeLayer('route');
        map.removeSource('route');
      }
    }

    const resetRoute = () => {
      destinations.splice(0, destinations.length);
      removeRoute();
      markers.forEach(marker => marker.remove());
    }

    return {
        newDeliveryRoute: newDeliveryRoute,
        resetRoute: resetRoute,
    }

}

export default Router;