const API_BASE_URL = "https://api.frankfurter.dev/v2";

export async function getLatestRate(from = "USD", to = "PKR") {
    const url = `${API_BASE_URL}/rate/${from}/${to}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Unable to fetch the latest exchange rate.");
    }

    return response.json();
}

export async function getHistoricalRates(
    from,
    to,
    startDate,
    endDate
) {
    const params = new URLSearchParams({
        base: from,
        quotes: to,
        from: startDate,
        to: endDate,
    });

    const response = await fetch(
        `${API_BASE_URL}/rates?${params}`
    );

    if (!response.ok) {
        throw new Error("Unable to fetch historical exchange rates.");
    }

    return response.json();
}

export async function getCurrencies() {
    const response = await fetch(`${API_BASE_URL}/currencies`);

    if (!response.ok) {
        throw new Error("Unable to fetch supported currencies.");
    }

    return response.json();
}

