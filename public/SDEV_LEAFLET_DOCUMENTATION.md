# sdev Leaflet Documentation

## Interactive Maps for sdev

The sdev Leaflet module provides powerful geographic mapping capabilities, allowing you to create interactive maps, markers, shapes, and more using the familiar sdev syntax.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Map Creation](#map-creation)
3. [Markers & Popups](#markers--popups)
4. [Shapes](#shapes)
5. [Polylines & Polygons](#polylines--polygons)
6. [Layers](#layers)
7. [Events](#events)
8. [Controls](#controls)
9. [GeoJSON](#geojson)
10. [Utilities](#utilities)
11. [Complete Examples](#complete-examples)

---

## Getting Started

### Basic Setup

To use Leaflet features in sdev, first create a map container:

```sdev
// Create a map centered on coordinates with zoom level
forge myMap be createMap("map-container", 51.505, -0.09, 13)
```

### HTML Setup

Your HTML page needs a container div and Leaflet CSS/JS:

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script src="sdev-interpreter.js"></script>
    <style>
        #map-container { height: 500px; width: 100%; }
    </style>
</head>
<body>
    <div id="map-container"></div>
    <script>
        const interpreter = new SdevInterpreter();
        interpreter.run(`
            forge map be createMap("map-container", 51.505, -0.09, 13)
            addMarker(map, 51.505, -0.09, "Hello from sdev!")
        `);
    </script>
</body>
</html>
```

---

## Map Creation

### createMap(containerId, lat, lng, zoom)

Creates a new Leaflet map instance.

| Parameter | Type | Description |
|-----------|------|-------------|
| containerId | text | ID of the HTML container element |
| lat | number | Initial latitude center |
| lng | number | Initial longitude center |
| zoom | number | Initial zoom level (1-18) |

```sdev
// Create a map of London
forge londonMap be createMap("map", 51.505, -0.09, 13)

// Create a map of New York
forge nyMap be createMap("nyc-map", 40.7128, -74.0060, 12)
```

### setMapView(map, lat, lng, zoom)

Changes the map's center and zoom level.

```sdev
forge map be createMap("map", 0, 0, 2)

// Pan to Paris
setMapView(map, 48.8566, 2.3522, 14)
```

### getMapCenter(map)

Returns the current center coordinates as a tome (dictionary).

```sdev
forge center be getMapCenter(map)
speak("Lat: " + morph(center["lat"], "text"))
speak("Lng: " + morph(center["lng"], "text"))
```

### getMapZoom(map)

Returns the current zoom level.

```sdev
forge zoom be getMapZoom(map)
speak("Current zoom: " + morph(zoom, "text"))
```

### getMapBounds(map)

Returns the visible map bounds.

```sdev
forge bounds be getMapBounds(map)
// bounds contains: north, south, east, west
```

---

## Markers & Popups

### addMarker(map, lat, lng, popupText?)

Adds a marker to the map with an optional popup.

```sdev
forge map be createMap("map", 51.505, -0.09, 13)

// Simple marker
forge marker1 be addMarker(map, 51.505, -0.09)

// Marker with popup
forge marker2 be addMarker(map, 51.51, -0.08, "Click me!")
```

### addMarkerIcon(map, lat, lng, iconUrl, iconSize, popupText?)

Adds a marker with a custom icon.

| Parameter | Type | Description |
|-----------|------|-------------|
| iconUrl | text | URL to the icon image |
| iconSize | list | [width, height] in pixels |

```sdev
forge map be createMap("map", 51.505, -0.09, 13)

forge customMarker be addMarkerIcon(
    map, 
    51.505, 
    -0.09, 
    "https://example.com/pin.png",
    [32, 32],
    "Custom icon marker!"
)
```

### removeMarker(map, marker)

Removes a marker from the map.

```sdev
forge marker be addMarker(map, 51.505, -0.09, "Temporary")
// Later...
removeMarker(map, marker)
```

### setMarkerPosition(marker, lat, lng)

Moves an existing marker to new coordinates.

```sdev
forge marker be addMarker(map, 51.505, -0.09)

// Animate marker movement
forge i be 0
cycle i < 100 ::
    setMarkerPosition(marker, 51.505 + i * 0.001, -0.09 + i * 0.001)
    delay(50)
    i be i + 1
;;
```

### bindPopup(marker, content)

Attaches a popup to an existing marker.

```sdev
forge marker be addMarker(map, 51.505, -0.09)
bindPopup(marker, "<b>Bold text!</b><br>HTML works here")
```

### bindTooltip(marker, content)

Attaches a tooltip (shows on hover) to a marker.

```sdev
forge marker be addMarker(map, 51.505, -0.09)
bindTooltip(marker, "Hover tooltip")
```

### openPopup(marker)

Programmatically opens the marker's popup.

```sdev
forge marker be addMarker(map, 51.505, -0.09, "Hello!")
openPopup(marker)
```

---

## Shapes

### addCircle(map, lat, lng, radius, options?)

Adds a circle to the map.

| Parameter | Type | Description |
|-----------|------|-------------|
| radius | number | Radius in meters |
| options | tome | Style options (optional) |

```sdev
forge map be createMap("map", 51.505, -0.09, 13)

// Simple circle
forge circle1 be addCircle(map, 51.505, -0.09, 500)

// Styled circle
forge options be :: 
    "color": "#ff0000",
    "fillColor": "#ff6666",
    "fillOpacity": 0.5,
    "weight": 2
;;
forge circle2 be addCircle(map, 51.51, -0.08, 300, options)
```

### addCircleMarker(map, lat, lng, radius, options?)

Adds a circle marker (radius in pixels, not meters).

```sdev
forge dot be addCircleMarker(map, 51.505, -0.09, 10, :: 
    "color": "#3388ff",
    "fillColor": "#3388ff",
    "fillOpacity": 0.8
;;)
```

### addRectangle(map, lat1, lng1, lat2, lng2, options?)

Adds a rectangle defined by opposite corners.

```sdev
forge rect be addRectangle(
    map,
    51.49, -0.10,  // Southwest corner
    51.52, -0.06,  // Northeast corner
    :: "color": "#ff7800", "weight": 1 ;;
)
```

---

## Polylines & Polygons

### addPolyline(map, points, options?)

Draws a line through multiple points.

| Parameter | Type | Description |
|-----------|------|-------------|
| points | list | List of [lat, lng] coordinate pairs |
| options | tome | Style options |

```sdev
forge map be createMap("map", 51.505, -0.09, 13)

forge route be [
    [51.505, -0.09],
    [51.51, -0.08],
    [51.52, -0.06],
    [51.515, -0.05]
]

forge line be addPolyline(map, route, ::
    "color": "#ff0000",
    "weight": 4,
    "opacity": 0.8,
    "dashArray": "10, 10"
;;)
```

### addPolygon(map, points, options?)

Creates a closed polygon shape.

```sdev
forge triangle be [
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]

forge poly be addPolygon(map, triangle, ::
    "color": "#00ff00",
    "fillColor": "#00ff88",
    "fillOpacity": 0.4
;;)
```

### addMultiPolygon(map, polygons, options?)

Creates multiple polygons as a single layer.

```sdev
forge shapes be [
    [[51.51, -0.12], [51.51, -0.10], [51.52, -0.10], [51.52, -0.12]],
    [[51.51, -0.08], [51.51, -0.06], [51.52, -0.06], [51.52, -0.08]]
]

forge multiPoly be addMultiPolygon(map, shapes, ::
    "color": "#9900ff"
;;)
```

---

## Layers

### addTileLayer(map, urlTemplate, options?)

Adds a custom tile layer (base map).

```sdev
forge map be createMap("map", 51.505, -0.09, 13)

// OpenStreetMap (default)
addTileLayer(map, "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", ::
    "attribution": "© OpenStreetMap contributors"
;;)

// Satellite imagery
addTileLayer(map, "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", ::
    "attribution": "© Esri"
;;)
```

### createLayerGroup()

Creates an empty layer group for organizing layers.

```sdev
forge markers be createLayerGroup()
addMarker(markers, 51.505, -0.09, "Marker 1")
addMarker(markers, 51.51, -0.08, "Marker 2")
addLayerToMap(map, markers)
```

### addLayerToMap(map, layer)

Adds a layer or layer group to the map.

```sdev
forge group be createLayerGroup()
// Add items to group...
addLayerToMap(map, group)
```

### removeLayerFromMap(map, layer)

Removes a layer from the map.

```sdev
removeLayerFromMap(map, markers)
```

### clearLayer(layer)

Removes all items from a layer group.

```sdev
clearLayer(markers)
```

---

## Events

### onMapClick(map, callback)

Handles map click events.

```sdev
forge map be createMap("map", 51.505, -0.09, 13)

onMapClick(map, (event) -> ::
    forge lat be event["lat"]
    forge lng be event["lng"]
    addMarker(map, lat, lng, "Clicked at " + morph(lat, "text") + ", " + morph(lng, "text"))
;;)
```

### onMapZoom(map, callback)

Handles zoom changes.

```sdev
onMapZoom(map, (event) -> ::
    forge zoom be getMapZoom(map)
    speak("Zoom changed to: " + morph(zoom, "text"))
;;)
```

### onMapMove(map, callback)

Handles map movement (pan).

```sdev
onMapMove(map, (event) -> ::
    forge center be getMapCenter(map)
    speak("Map moved to: " + morph(center["lat"], "text") + ", " + morph(center["lng"], "text"))
;;)
```

### onMarkerClick(marker, callback)

Handles marker click events.

```sdev
forge marker be addMarker(map, 51.505, -0.09)

onMarkerClick(marker, (event) -> ::
    speak("Marker was clicked!")
;;)
```

### onMarkerDrag(marker, callback)

Handles marker drag events (marker must be draggable).

```sdev
forge marker be addMarker(map, 51.505, -0.09)
setMarkerDraggable(marker, yep)

onMarkerDrag(marker, (event) -> ::
    forge pos be getMarkerPosition(marker)
    speak("Dragged to: " + morph(pos["lat"], "text"))
;;)
```

---

## Controls

### addZoomControl(map, position?)

Adds zoom controls to the map.

| Position | Description |
|----------|-------------|
| "topleft" | Top left corner |
| "topright" | Top right corner |
| "bottomleft" | Bottom left corner |
| "bottomright" | Bottom right corner |

```sdev
addZoomControl(map, "bottomright")
```

### addScaleControl(map, options?)

Adds a scale indicator.

```sdev
addScaleControl(map, ::
    "position": "bottomleft",
    "metric": yep,
    "imperial": nope
;;)
```

### addAttributionControl(map, prefix?)

Adds attribution text.

```sdev
addAttributionControl(map, "Powered by sdev")
```

### addLayerControl(map, baseLayers, overlays)

Adds a layer switcher control.

```sdev
forge osm be addTileLayer(map, "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
forge satellite be addTileLayer(map, "https://server.arcgisonline.com/...")

forge bases be ::
    "Streets": osm,
    "Satellite": satellite
;;

forge markers be createLayerGroup()
forge overlays be ::
    "Markers": markers
;;

addLayerControl(map, bases, overlays)
```

---

## GeoJSON

### addGeoJSON(map, geoJsonData, options?)

Adds GeoJSON data to the map.

```sdev
forge geojson be ::
    "type": "FeatureCollection",
    "features": [
        ::
            "type": "Feature",
            "geometry": ::
                "type": "Point",
                "coordinates": [-0.09, 51.505]
            ;;,
            "properties": ::
                "name": "London"
            ;;
        ;;
    ]
;;

forge layer be addGeoJSON(map, geojson, ::
    "style": ::
        "color": "#ff0000",
        "weight": 2
    ;;
;;)
```

### geoJSONStyle(feature)

Custom style function for GeoJSON features.

```sdev
forge layer be addGeoJSON(map, geojson, ::
    "style": (feature) -> ::
        ponder feature["properties"]["type"] equals "road" ::
            yield :: "color": "#888888", "weight": 3 ;;
        ;;
        otherwise ::
            yield :: "color": "#00ff00", "weight": 1 ;;
        ;;
    ;;
;;)
```

---

## Utilities

### latLng(lat, lng)

Creates a coordinate object.

```sdev
forge coord be latLng(51.505, -0.09)
speak("Latitude: " + morph(coord["lat"], "text"))
```

### distance(lat1, lng1, lat2, lng2)

Calculates distance between two points in meters.

```sdev
forge dist be distance(51.505, -0.09, 51.51, -0.08)
speak("Distance: " + morph(dist, "text") + " meters")
```

### boundsContains(bounds, lat, lng)

Checks if a point is within bounds.

```sdev
forge bounds be getMapBounds(map)
forge inside be boundsContains(bounds, 51.505, -0.09)
ponder inside ::
    speak("Point is visible on map")
;;
```

### fitBounds(map, lat1, lng1, lat2, lng2)

Adjusts the map view to fit the given bounds.

```sdev
fitBounds(map, 51.49, -0.12, 51.52, -0.05)
```

### invalidateSize(map)

Recalculates map size (use after container resize).

```sdev
invalidateSize(map)
```

---

## Complete Examples

### Interactive City Markers

```sdev
// Create a world map with major cities
forge map be createMap("map", 20, 0, 2)

// City data
forge cities be [
    :: "name": "London", "lat": 51.505, "lng": -0.09 ;;,
    :: "name": "Paris", "lat": 48.8566, "lng": 2.3522 ;;,
    :: "name": "New York", "lat": 40.7128, "lng": -74.0060 ;;,
    :: "name": "Tokyo", "lat": 35.6762, "lng": 139.6503 ;;,
    :: "name": "Sydney", "lat": -33.8688, "lng": 151.2093 ;;
]

// Add markers for each city
each(cities, (city) -> ::
    forge marker be addMarker(map, city["lat"], city["lng"], city["name"])
    bindTooltip(marker, city["name"])
;;)

// Click to add new markers
onMapClick(map, (e) -> ::
    addMarker(map, e["lat"], e["lng"], "New Location")
;;)
```

### Route Visualization

```sdev
// Visualize a hiking route
forge map be createMap("map", 51.505, -0.09, 14)

forge trailPoints be [
    [51.500, -0.10],
    [51.502, -0.095],
    [51.505, -0.09],
    [51.508, -0.085],
    [51.510, -0.08],
    [51.512, -0.075]
]

// Draw the route
forge trail be addPolyline(map, trailPoints, ::
    "color": "#e74c3c",
    "weight": 5,
    "opacity": 0.8
;;)

// Add start and end markers
addMarker(map, 51.500, -0.10, "🚶 Start")
addMarker(map, 51.512, -0.075, "🏁 Finish")

// Add distance markers along the way
forge totalDist be 0
forge i be 1
cycle i < measure(trailPoints) ::
    forge prev be pluck(trailPoints, i - 1)
    forge curr be pluck(trailPoints, i)
    forge dist be distance(prev[0], prev[1], curr[0], curr[1])
    totalDist be totalDist + dist
    
    addCircleMarker(map, curr[0], curr[1], 5, ::
        "color": "#3498db",
        "fillColor": "#3498db",
        "fillOpacity": 1
    ;;)
    i be i + 1
;;

speak("Total distance: " + morph(ground(totalDist), "text") + " meters")
```

### Heatmap Zones

```sdev
// Create density visualization with circles
forge map be createMap("map", 51.505, -0.09, 13)

// Data points with intensity
forge hotspots be [
    :: "lat": 51.505, "lng": -0.09, "intensity": 100 ;;,
    :: "lat": 51.510, "lng": -0.08, "intensity": 75 ;;,
    :: "lat": 51.500, "lng": -0.10, "intensity": 50 ;;,
    :: "lat": 51.508, "lng": -0.095, "intensity": 90 ;;
]

// Create gradient circles for each hotspot
each(hotspots, (spot) -> ::
    // Outer glow
    addCircle(map, spot["lat"], spot["lng"], spot["intensity"] * 5, ::
        "color": "transparent",
        "fillColor": "#ff6600",
        "fillOpacity": 0.2
    ;;)
    
    // Inner core
    addCircle(map, spot["lat"], spot["lng"], spot["intensity"] * 2, ::
        "color": "transparent",
        "fillColor": "#ff0000",
        "fillOpacity": 0.5
    ;;)
;;)
```

### Layer Toggle System

```sdev
// Multi-layer map with toggle controls
forge map be createMap("map", 51.505, -0.09, 13)

// Create layer groups
forge restaurants be createLayerGroup()
forge hotels be createLayerGroup()
forge attractions be createLayerGroup()

// Add restaurant markers
addMarker(restaurants, 51.505, -0.09, "Pizza Place")
addMarker(restaurants, 51.508, -0.085, "Sushi Bar")
addMarker(restaurants, 51.502, -0.095, "Burger Joint")

// Add hotel markers  
addMarker(hotels, 51.510, -0.08, "Grand Hotel")
addMarker(hotels, 51.500, -0.10, "Budget Inn")

// Add attraction markers
addMarker(attractions, 51.507, -0.09, "Museum")
addMarker(attractions, 51.503, -0.07, "Park")

// Add all layers to map
addLayerToMap(map, restaurants)
addLayerToMap(map, hotels)
addLayerToMap(map, attractions)

// Create layer control
forge overlays be ::
    "🍕 Restaurants": restaurants,
    "🏨 Hotels": hotels,
    "🎭 Attractions": attractions
;;

addLayerControl(map, ::;;, overlays)
```

### Animated Marker

```sdev
// Animate a marker along a path
forge map be createMap("map", 51.505, -0.09, 14)

forge path be [
    [51.500, -0.10],
    [51.502, -0.095],
    [51.505, -0.09],
    [51.508, -0.085],
    [51.510, -0.08]
]

// Draw the path
addPolyline(map, path, :: "color": "#3498db", "weight": 3, "dashArray": "5, 10" ;;)

// Create moving marker
forge mover be addMarker(map, path[0][0], path[0][1], "🚗")

// Animate along path
conjure animateMarker(marker, points, index) ::
    ponder index >= measure(points) ::
        yield void
    ;;
    
    forge target be pluck(points, index)
    setMarkerPosition(marker, target[0], target[1])
    
    delay(500)
    animateMarker(marker, points, index + 1)
;;

animateMarker(mover, path, 0)
```

---

## Style Reference

### Common Style Options

| Property | Type | Description |
|----------|------|-------------|
| color | text | Stroke color (hex or name) |
| weight | number | Stroke width in pixels |
| opacity | number | Stroke opacity (0-1) |
| fillColor | text | Fill color |
| fillOpacity | number | Fill opacity (0-1) |
| dashArray | text | Stroke dash pattern |
| lineCap | text | Line cap style |
| lineJoin | text | Line join style |

### Icon Options

| Property | Type | Description |
|----------|------|-------------|
| iconUrl | text | URL to icon image |
| iconSize | list | [width, height] |
| iconAnchor | list | [x, y] anchor point |
| popupAnchor | list | [x, y] popup offset |
| shadowUrl | text | URL to shadow image |

---

## Tips & Best Practices

1. **Performance**: Use layer groups for many markers
2. **Memory**: Remove unused layers with `removeLayerFromMap`
3. **Mobile**: Use `invalidateSize` after orientation changes
4. **Clustering**: For 100+ markers, consider marker clustering
5. **Tile Caching**: Custom tile layers can be cached for offline use

---

## Error Handling

```sdev
attempt ::
    forge map be createMap("nonexistent-id", 0, 0, 10)
;; rescue error ::
    speak("Failed to create map: " + error)
;;
```

---

*sdev Leaflet Module — Mapping made magical* ✨🗺️
