export async function getLocationViaIp(ip: string) {
  try {
    // Get the IP Address

    if (ip === "Unknown") {
      return { error: "IP address not found", status: 400 };
    }

    // Fetch location data from ip-api.com
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=country,regionName,city,lat,lon,isp`
    );
    const data = await response.json();

    if (data.status === "fail") {
      return { error: "Failed to fetch location data", status: 500 };
    }

    return {
      country: data.country,
      region: data.regionName,
      city: data.city,
      latitude: data.lat,
      longitude: data.lon,
      isp: data.isp, // Internet Service Provider
    };
  } catch (error) {
    console.error("Error fetching location:", error);
    return { error: "Failed to retrieve location data", status: 500 };
  }
}
