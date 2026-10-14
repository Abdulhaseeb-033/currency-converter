
import {
    getLatestRate,
    getHistoricalRates,
    getCurrencies,
} from "./api.js";

import {
    updateCurrentRate,
    renderHistoricalChart,
    renderRecentMovement,
} from "./ui.js";

import { initSavedPairs } from "./savedPairs.js";
import { initTopNavigation } from "./navigation.js";
import { initQuickConvert } from "./quickConvert.js";

const baseCurrency = document.querySelector("#baseCurrency");
const targetCurrency = document.querySelector("#targetCurrency");
const swapCurrenciesBtn = document.querySelector("#swapCurrenciesBtn");
const chartStatus = document.querySelector("#chartStatus");
const chartFilters = document.querySelectorAll(".chart-filter");
const refreshButton = document.querySelector("#refreshRatesBtn");

const quickConvertAmount = document.querySelector("#quickConvertAmount");
const quickConvertFrom = document.querySelector("#quickConvertFrom");
const quickConvertTo = document.querySelector("#quickConvertTo");
const quickConvertResult = document.querySelector("#quickConvertResult");
const quickConvertRate = document.querySelector("#quickConvertRate");
const quickConvertStatus = document.querySelector("#quickConvertStatus");


let currentRange = "7D";

let selectedFrom = localStorage.getItem("currencyFrom") || "USD";
let selectedTo = localStorage.getItem("currencyTo") || "PKR";


function getDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatAmount(amount) {
    return new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 6,
    }).format(amount);
}

async function loadCurrencies() {
    try {
        const currencies = await getCurrencies();

        if (!Array.isArray(currencies) || currencies.length === 0) {
            throw new Error("No currencies were returned by the API.");
        }

        const supportedCurrencies = currencies.filter(
            (currency) => currency.iso_code && currency.name
        );

        const dropdowns = [
            baseCurrency,
            targetCurrency,
            quickConvertFrom,
            quickConvertTo,
        ];

        function populateDropdown(selectElement) {
            if (!selectElement) return;

            selectElement.replaceChildren();

            supportedCurrencies.forEach((currency) => {
                const option = document.createElement("option");

                option.value = currency.iso_code;
                option.textContent =
                    `${currency.iso_code} — ${currency.name}`;

                selectElement.appendChild(option);
            });
        }

        dropdowns.forEach(populateDropdown);

        const supportedCodes = supportedCurrencies.map(
            (currency) => currency.iso_code
        );

        if (!supportedCodes.includes(selectedFrom)) {
            selectedFrom = supportedCodes.includes("USD")
                ? "USD"
                : supportedCodes[0];
        }

        if (!supportedCodes.includes(selectedTo)) {
            selectedTo = supportedCodes.includes("PKR")
                ? "PKR"
                : supportedCodes.find(
                    (code) => code !== selectedFrom
                ) || selectedFrom;
        }

        baseCurrency.value = selectedFrom;
        targetCurrency.value = selectedTo;

        syncQuickConvertPair();

        await loadSelectedPair();
    } catch (error) {
        console.error("Failed to load currencies:", error);

        if (chartStatus) {
            chartStatus.textContent =
                "Unable to load currencies. Please refresh the page.";
        }

        if (quickConvertStatus) {
            quickConvertStatus.textContent =
                "Unable to load currencies. Please refresh the page.";
        }
    }
}

function syncQuickConvertPair() {
    if (!quickConvertFrom || !quickConvertTo) return;

    quickConvertFrom.value = selectedFrom;
    quickConvertTo.value = selectedTo;

    resetQuickConvertResult();
}

function resetQuickConvertResult() {
    if (quickConvertResult) {
        quickConvertResult.textContent = "—";
    }

    if (quickConvertRate) {
        quickConvertRate.textContent =
            "Enter an amount to convert.";
    }

    if (quickConvertStatus) {
        quickConvertStatus.textContent = "";
    }
}

async function loadLatestRate() {
    try {
        const rateData = await getLatestRate(
            selectedFrom,
            selectedTo
        );

        updateCurrentRate(rateData, selectedFrom, selectedTo);
    } catch (error) {
        console.error("Failed to load exchange rate:", error);

        const rateElement = document.querySelector("#currentRate");

        if (rateElement) {
            rateElement.textContent = "Unavailable";
        }
    }
}

async function loadHistoricalChart(range = currentRange) {
    if (!chartStatus) return;

    const daysByRange = {
        "7D": 6,
        "1M": 30,
        "3M": 90,
        "1Y": 365,
    };

    currentRange = daysByRange[range] ? range : "7D";

    chartFilters.forEach((button) => {
        const isActive = button.dataset.range === currentRange;

        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });

    const endDate = new Date();
    const startDate = new Date(endDate);

    startDate.setDate(
        startDate.getDate() - daysByRange[currentRange]
    );

    chartStatus.textContent = "Loading historical rates...";

    try {
        const historicalData = await getHistoricalRates(
            selectedFrom,
            selectedTo,
            getDateString(startDate),
            getDateString(endDate)
        );

        renderHistoricalChart(
            historicalData,
            selectedFrom,
            selectedTo
        );

        renderRecentMovement(
            historicalData,
            selectedFrom,
            selectedTo
        );
    } catch (error) {
        console.error("Failed to load historical rates:", error);

        chartStatus.textContent =
            "Unable to load historical rates. Please try again.";
    }
}

async function loadSelectedPair() {
    if (selectedFrom === selectedTo) {
        if (chartStatus) {
            chartStatus.textContent =
                "Please select two different currencies.";
        }

        return;
    }

    localStorage.setItem("currencyFrom", selectedFrom);
    localStorage.setItem("currencyTo", selectedTo);

    await Promise.all([
        loadLatestRate(),
        loadHistoricalChart(currentRange),
    ]);
}

baseCurrency.addEventListener("change", () => {
    selectedFrom = baseCurrency.value;

    syncQuickConvertPair();
    loadSelectedPair();
});

targetCurrency.addEventListener("change", () => {
    selectedTo = targetCurrency.value;

    syncQuickConvertPair();
    loadSelectedPair();
});

swapCurrenciesBtn.addEventListener("click", () => {
    const previousFrom = selectedFrom;

    selectedFrom = selectedTo;
    selectedTo = previousFrom;

    baseCurrency.value = selectedFrom;
    targetCurrency.value = selectedTo;

    syncQuickConvertPair();
    loadSelectedPair();
});

chartFilters.forEach((button) => {
    button.addEventListener("click", () => {
        loadHistoricalChart(button.dataset.range);
    });
});

refreshButton?.addEventListener("click", async () => {
    refreshButton.disabled = true;

    try {
        await loadSelectedPair();
    } finally {
        refreshButton.disabled = false;
    }
});

initQuickConvert({
    getLatestRate,
    formatAmount,
});

initTopNavigation();
loadCurrencies();

initSavedPairs({
    getSelectedPair: () => ({
        from: selectedFrom,
        to: selectedTo,
    }),

    onSelectPair: (pair) => {
        selectedFrom = pair.from;
        selectedTo = pair.to;

        baseCurrency.value = pair.from;
        targetCurrency.value = pair.to;

        syncQuickConvertPair();
        loadSelectedPair();
    },
});
