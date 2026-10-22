(function () {
    const role = document.getElementById("role");
    const box = document.getElementById("locationFields");
    const lat = document.getElementById("latitude");
    const lng = document.getElementById("longitude");
    const status = document.getElementById("locationStatus");

    if (!role || !box) return;

    // Sirf NGO ke liye location fields dikhao
    function toggleFields() {
        box.classList.toggle("d-none", role.value !== "ngo");
    }
    role.addEventListener("change", toggleFields);
    toggleFields();

    function setCoords(latitude, longitude) {
        lat.value = Number(latitude).toFixed(6);
        lng.value = Number(longitude).toFixed(6);
    }

    // ---------- Current location (GPS) ----------
    document.getElementById("useMyLocation").addEventListener("click", () => {
        if (!navigator.geolocation) {
            status.textContent = "Is browser mein location support nahi hai.";
            return;
        }

        status.textContent = "Location dhoondh rahe hain...";

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setCoords(pos.coords.latitude, pos.coords.longitude);
                status.textContent = "✅ Location mil gayi.";
            },
            (err) => {
                status.textContent =
                    "Location nahi mili (" + err.message + "). 'Find from address' try karo.";
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    });

    // ---------- Address se location (OpenStreetMap Nominatim) ----------
    document.getElementById("findFromAddress").addEventListener("click", async () => {
        const address = document.querySelector('[name="address"]').value.trim();
        const city = document.querySelector('[name="city"]').value.trim();
        const query = [address, city].filter(Boolean).join(", ");

        if (!query) {
            status.textContent = "Pehle address ya city bharo.";
            return;
        }

        status.textContent = "Address dhoondh rahe hain...";

        try {
            const response = await fetch(
                "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" +
                encodeURIComponent(query)
            );
            const results = await response.json();

            if (!results.length) {
                status.textContent = "Address nahi mila. Aur detail likho ya GPS button use karo.";
                return;
            }

            setCoords(results[0].lat, results[0].lon);
            status.textContent = "✅ Mila: " + results[0].display_name;
        } catch (error) {
            console.error("Geocoding error:", error);
            status.textContent = "Address search fail ho gaya. GPS button try karo.";
        }
    });
})();