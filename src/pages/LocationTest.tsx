import LocationMap from "../components/location/LocationMap";
import { useUserLocation } from "../hooks/useUserLocation";

export default function LocationTest() {
  // Temporary ID only for testing
  const userId = "00000000-0000-0000-0000-000000000001";

  const {
    latitude,
    longitude,
    accuracy,
    loading,
    error,
    sharing,
    startLocationSharing,
    stopLocationSharing,
  } = useUserLocation(userId, "patient");

  return (
    <div
      style={{
        padding: "30px",
        maxWidth: "1000px",
        margin: "0 auto",
      }}
    >
      <h1>📍 Location Test</h1>

      <p>
        This page tests the current-location system before
        we add it to Patient, Doctor and ASHA dashboards.
      </p>

      {!sharing ? (
        <button
          onClick={startLocationSharing}
          style={{
            padding: "12px 20px",
            cursor: "pointer",
          }}
        >
          📍 Start Location
        </button>
      ) : (
        <button
          onClick={stopLocationSharing}
          style={{
            padding: "12px 20px",
            cursor: "pointer",
          }}
        >
          ⏹ Stop Location
        </button>
      )}

      {loading && (
        <p>Getting your current location...</p>
      )}

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {latitude !== null && longitude !== null && (
        <div style={{ marginTop: "20px" }}>
          <h3>📍 Your Current Location</h3>

          <p>
            <strong>Latitude:</strong> {latitude}
          </p>

          <p>
            <strong>Longitude:</strong> {longitude}
          </p>

          {accuracy !== null && (
            <p>
              <strong>Accuracy:</strong>{" "}
              {accuracy.toFixed(2)} meters
            </p>
          )}

          <LocationMap
            latitude={latitude}
            longitude={longitude}
            height="450px"
          />
        </div>
      )}
    </div>
  );
}