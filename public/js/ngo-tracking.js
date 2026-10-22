let trackingMap = null;
let deliveryMarker = null;
let trackingInterval = null;
let activeRequestId = null;
let destinationMarker = null;

async function trackDelivery(requestId) {
    try {
        const response = await fetch(
            `/dashboard/ngo/track-delivery/${encodeURIComponent(requestId)}`
        );

        const data = await response.json();

        const statusElement = document.getElementById("trackingStatus");

        if (!statusElement) {
            console.error("Tracking status element not found.");
            return;
        }

        if (!response.ok || !data.success) {
            statusElement.textContent =
                data.message || "Unable to fetch delivery location.";
            if (response.status === 400 && trackingInterval) {
                clearInterval(trackingInterval);
            }
            return;
        }

        const latitude = Number(data.location.latitude);
        const longitude = Number(data.location.longitude);

        if (
            !Number.isFinite(latitude) ||
            !Number.isFinite(longitude) ||
            latitude < -90 ||
            latitude > 90 ||
            longitude < -180 ||
            longitude > 180
        ) {
            statusElement.textContent = "Invalid delivery coordinates.";
            return;
        }

        const position = [latitude, longitude];

        if (!trackingMap) {
            trackingMap = L.map("deliveryTrackingMap").setView(position, 15);

            L.tileLayer(
                "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                {
                    attribution: "&copy; OpenStreetMap contributors"
                }
            ).addTo(trackingMap);

            deliveryMarker = L.marker(position)
                .addTo(trackingMap)
                .bindPopup("Delivery Person");

            deliveryMarker.openPopup();

            const dest = data.destination;
            const destLat = Number(dest?.latitude);
            const destLng = Number(dest?.longitude);

            if (
                dest &&
                dest.latitude != null && dest.longitude != null &&
                Number.isFinite(destLat) && Number.isFinite(destLng)
            ) {
                // textContent use kiya hai taaki NGO ke naam se XSS na ho
                const popup = document.createElement("div");
                popup.textContent = `Destination: ${dest.name || "NGO"}`;

                destinationMarker = L.circleMarker([destLat, destLng], {
                    radius: 10,
                    color: "#198754",
                    fillOpacity: 0.8
                }).addTo(trackingMap).bindPopup(popup);

                trackingMap.fitBounds([position, [destLat, destLng]], {
                    padding: [40, 40]
                });
            }

        } else {
            // Move marker to the latest GPS coordinates
            deliveryMarker.setLatLng(position);

            // Keep the delivery person visible on the map
            if (!trackingMap.getBounds().contains(position)) {
                trackingMap.panTo(position);
            }
        }

        const updatedAt = data.location.updatedAt
            ? new Date(data.location.updatedAt).toLocaleTimeString()
            : "Unknown";

        statusElement.textContent =
            `Delivery status: ${data.status} | Last location update: ${updatedAt}`;

    } catch (error) {
        console.error("Live tracking error:", error);

        const statusElement = document.getElementById("trackingStatus");

        if (statusElement) {
            statusElement.textContent =
                "Could not connect to the tracking service.";
        }
    }
}

function startDeliveryTracking(requestId) {
    if (trackingInterval) {
        clearInterval(trackingInterval);
    }

    activeRequestId = requestId;

    const statusElement = document.getElementById("trackingStatus");

    if (statusElement) {
        statusElement.textContent = "Fetching delivery location...";
    }

    trackDelivery(activeRequestId);

    trackingInterval = setInterval(() => {
        if (activeRequestId) {
            trackDelivery(activeRequestId);
        }
    }, 5000);
}
