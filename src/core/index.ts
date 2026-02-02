export * from "./ObjectsInMap";
export * from "./Panorama";
export * from "./LocationPoint";
export * from "./MapContainer";
export * from "./MapObject";
export * from "./MapObjectProps";
export * from "./useMap";

// Automatické přidání odkazů na Bootstrap a Bootstrap Icons do hlavičky HTML
(function addBootstrapToHead() {
    const linkLeaflet = document.createElement("link");
    linkLeaflet.rel = "stylesheet";
    linkLeaflet.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(linkLeaflet);

    const linkLeaflet2 = document.createElement("script");
    linkLeaflet2.integrity =
        "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    linkLeaflet2.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    linkLeaflet2.crossOrigin = "";
    document.head.appendChild(linkLeaflet2);
})();

// <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
//     integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
//     crossorigin=""/>
//     <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
//     integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
//     crossorigin=""></script>
