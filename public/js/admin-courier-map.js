(function () {
    const REFRESH_MS = 10000;
    const statusEl = document.getElementById("courierStatus");
    const listEl = document.getElementById("courierList");

    const map = L.map("courierMap").setView([20.5937, 78.9629], 5);   // India
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    const markers = new Map();      // requestId -> marker
    let firstLoad = true;

    // Popup / card mein user ka text safe dikhane ke liye
    function textNode(tag, text, className) {
        const el = document.createElement(tag);
        el.textContent = text;
        if (className) el.className = className;
        return el;
    }

    function popupFor(c) {
        const box = document.createElement("div");
        box.appendChild(textNode("strong", c.courierName));
        box.appendChild(document.createElement("br"));
        box.appendChild(textNode("span", `${c.food} → ${c.ngo}`));
        box.appendChild(document.createElement("br"));
        box.appendChild(textNode("small", `Status: ${c.status.replaceAll("_", " ")}`));
        return box;
    }

    function renderList(couriers) {
        listEl.replaceChildren();

        couriers.forEach(c => {
            const col = textNode("div", "", "col-md-6 col-xl-4");
            const card = textNode("div", "", "card border-0 shadow-sm");
            const body = textNode("div", "", "card-body");

            body.appendChild(textNode("h6", c.courierName, "fw-bold mb-1"));
            body.appendChild(textNode("div", `${c.food} → ${c.ngo}`, "text-muted"));
            body.appendChild(textNode(
                "small",
                `${c.status.replaceAll("_", " ")} · updated ${new Date(c.updatedAt).toLocaleTimeString()}`,
                "text-muted"
            ));

            card.appendChild(body);
            col.appendChild(card);
            listEl.appendChild(col);
        });
    }

    async function refresh() {
        try {
            const response = await fetch("/dashboard/admin/courier-locations");
            const data = await response.json();

            if (!response.ok || !data.success) {
                statusEl.textContent = data.message || "Unable to load locations.";
                return;
            }

            const seen = new Set();

            data.couriers.forEach(c => {
                const lat = Number(c.latitude);
                const lng = Number(c.longitude);
                if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

                const key = String(c.requestId);
                seen.add(key);

                if (markers.has(key)) {
                    markers.get(key).setLatLng([lat, lng]).setPopupContent(popupFor(c));
                } else {
                    markers.set(key, L.marker([lat, lng]).addTo(map).bindPopup(popupFor(c)));
                }
            });

            // Jin deliveries ka kaam khatam, unke marker hatao
            for (const [key, marker] of markers) {
                if (!seen.has(key)) {
                    map.removeLayer(marker);
                    markers.delete(key);
                }
            }

            if (firstLoad && markers.size > 0) {
                map.fitBounds(L.featureGroup([...markers.values()]).getBounds(), {
                    padding: [40, 40],
                    maxZoom: 14
                });
                firstLoad = false;
            }

            renderList(data.couriers);
            statusEl.textContent = markers.size === 0
                ? "Abhi koi active courier nahi hai."
                : `${markers.size} active courier(s) · last refresh ${new Date().toLocaleTimeString()}`;

        } catch (error) {
            console.error("Courier map error:", error);
            statusEl.textContent = "Could not connect to the server.";
        }
    }

    refresh();
    setInterval(refresh, REFRESH_MS);
})();