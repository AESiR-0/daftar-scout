export const getSession = async () => {
  const session = await fetch("/api/endpoints/session", {
    method: "GET", // Ensure this matches your auth endpoint
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => {
    if (!res.ok) {
      throw new Error("Failed to fetch session");
    }
    return res.json();
  });
  if (!session?.user) {
    return null;
  }
  return session;
};
