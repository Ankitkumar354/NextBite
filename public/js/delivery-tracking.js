(function () {
    const mapEl = document.getElementById("deliveryMap");
    if (!mapEl) return;

    const hasActiveDelivery = mapEl.dataset.hasActive === "true";
    const SEND_INTERVAL_MS = 10000;

    let lastSent = 0;
    let watchId = null;
    let map = null;
    let marker = null;

    function updateMap(latitude, longitude) {
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
        const position = [latitude, longitude];

        if (!map) {
            map = L.map("deliveryMap").setView(position, 15);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "&copy; OpenStreetMap contributors"
            }).addTo(map);

            marker = L.marker(position)
                .addTo(map)
                .bindPopup("Delivery Person")
                .openPopup();
        } else {
            marker.setLatLng(position);
            if (!map.getBounds().contains(position)) {
                map.panTo(position);
            }
        }
    }

    function stopTracking() {
        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
        }
    }

    async function sendLocation(latitude, longitude) {
        try {
            const response = await fetch("/dashboard/delivery/location", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ latitude, longitude })
            });

            const data = await response.json();

            if (response.status === 409) {
                stopTracking();        // koi active delivery nahi
                return;
            }

            if (!response.ok) {
                console.error("Location update failed:", data.message);
                return;
            }

            updateMap(latitude, longitude);
        } catch (error) {
            console.error("Error sending location:", error);
        }
    }

    function startTracking() {
        if (!hasActiveDelivery) return;

        if (!navigator.geolocation) {
            console.error("Geolocation is not supported by this browser.");
            return;
        }

        watchId = navigator.geolocation.watchPosition(
            (position) => {
                const now = Date.now();
                if (now - lastSent < SEND_INTERVAL_MS) return;
                lastSent = now;

                sendLocation(position.coords.latitude, position.coords.longitude);
            },
            (error) => console.error("Location error:", error.message),
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
        );
    }

    // Page khulte hi last saved location dikhao (agar hai)
    async function loadLastLocation() {
        try {
            const response = await fetch("/dashboard/delivery/location");
            if (!response.ok) return;   // 404 = abhi location save nahi hui

            const data = await response.json();
            if (data.success) {
                updateMap(
                    Number(data.location.latitude),
                    Number(data.location.longitude)
                );
            }
        } catch (error) {
            console.error("Map error:", error);
        }
    }

    loadLastLocation();
    startTracking();
})();