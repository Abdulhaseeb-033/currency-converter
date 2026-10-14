export function updateCurrentRate(rateData, from = "USD", to = "PKR") {
  const rateElement = document.querySelector("#currentRate");
  const updatedElement = document.querySelector("#lastUpdated");
  const pairLabel = document.querySelector("#selectedPairLabel");
  const rateDescription = document.querySelector("#currentRateDescription");

  if (rateElement) {
    rateElement.textContent = Number(rateData.rate).toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      }
    );
  }

  if (updatedElement) {
    updatedElement.textContent = rateData.date;
  }

  if (pairLabel) {
    pairLabel.textContent = `${from} / ${to}`;
  }

  if (rateDescription) {
    rateDescription.textContent = `1 ${from} in ${to}`;
  }
}



let exchangeRateChart = null;

export function renderHistoricalChart(rateData, from, to) {
  const canvas = document.querySelector("#exchangeRateChart");
  const status = document.querySelector("#chartStatus");

  if (!canvas || !status) return;

  if (!Array.isArray(rateData) || rateData.length === 0) {
    status.textContent =
      "No historical rates are available for this period.";

    const periodHighElement = document.querySelector("#periodHigh");

    if (periodHighElement) {
      periodHighElement.textContent = "—";
    }

    if (exchangeRateChart) {
      exchangeRateChart.destroy();
      exchangeRateChart = null;
    }

    return;
  }

  const sortedRates = [...rateData].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const labels = sortedRates.map((item) => item.date);
  const values = sortedRates.map((item) => Number(item.rate));

  if (values.some((value) => !Number.isFinite(value))) {
    status.textContent = "The API returned invalid rate data.";
    return;
  }

  const periodHighElement = document.querySelector("#periodHigh");
  const pairLabel = document.querySelector("#selectedPairLabel");
  const rateDescription = document.querySelector("#currentRateDescription");

  const highestRate = Math.max(...values);

  if (periodHighElement) {
    periodHighElement.textContent = highestRate.toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      }
    );
  }

  if (pairLabel) {
    pairLabel.textContent = `${from} / ${to}`;
  }

  if (rateDescription) {
    rateDescription.textContent = `1 ${from} in ${to}`;
  }

  if (exchangeRateChart) {
    exchangeRateChart.destroy();
  }

  exchangeRateChart = new Chart(canvas, {
    type: "line",

    data: {
      labels,
      datasets: [
        {
          label: `${from} / ${to}`,
          data: values,
          borderColor: "#58D6A0",
          backgroundColor: "rgba(88, 214, 160, 0.10)",
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointBackgroundColor: "#58D6A0",
        },
      ],
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      interaction: {
        intersect: false,
        mode: "index",
      },

      plugins: {
        legend: {
          display: false,
        },

        tooltip: {
          callbacks: {
            label(context) {
              return `${from} / ${to}: ${context.parsed.y.toLocaleString(
                "en-US",
                {
                  maximumFractionDigits: 4,
                }
              )}`;
            },
          },
        },
      },

      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: "#929B95",
            maxTicksLimit: 7,
            maxRotation: 0,
          },
          border: {
            display: false,
          },
        },

        y: {
          grid: {
            color: "rgba(146, 155, 149, 0.12)",
          },
          ticks: {
            color: "#929B95",
          },
          border: {
            display: false,
          },
        },
      },
    },
  });

  status.textContent =
    `${from} to ${to} · ${sortedRates.length} historical rate records`;
}


export function renderRecentMovement(rateData, from, to) {
  const pairElement = document.querySelector("#movementPair");
  const directionElement = document.querySelector("#movementDirection");
  const differenceElement = document.querySelector("#movementDifference");
  const percentageElement = document.querySelector("#movementPercentage");
  const statusElement = document.querySelector("#movementStatus");

  if (!pairElement || !directionElement || !differenceElement ||
    !percentageElement || !statusElement) {
    return;
  }

  if (!Array.isArray(rateData) || rateData.length < 2) {
    statusElement.textContent =
      "Not enough historical data to calculate movement.";
    return;
  }

  const sortedRates = [...rateData].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  const startingRate = Number(sortedRates[0].rate);
  const latestRate = Number(sortedRates[sortedRates.length - 1].rate);

  if (
    !Number.isFinite(startingRate) ||
    !Number.isFinite(latestRate) ||
    startingRate <= 0
  ) {
    statusElement.textContent =
      "Unable to calculate movement from the available data.";
    return;
  }

  const difference = latestRate - startingRate;
  const percentageChange = (difference / startingRate) * 100;

  const direction = difference > 0
    ? "up"
    : difference < 0
      ? "down"
      : "unchanged";

  pairElement.textContent = `${from} / ${to}`;

  directionElement.textContent =
    direction === "up"
      ? "Rate increased"
      : direction === "down"
        ? "Rate decreased"
        : "No change";

  differenceElement.textContent =
    `${difference > 0 ? "+" : ""}${difference.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    })} ${to}`;

  percentageElement.textContent =
    `${percentageChange > 0 ? "+" : ""}${percentageChange.toFixed(2)}%`;

  const movementColor = direction === "up"
    ? "#58D6A0"
    : direction === "down"
      ? "#F87171"
      : "#929B95";

  directionElement.style.color = movementColor;
  differenceElement.style.color = movementColor;
  percentageElement.style.color = movementColor;

  statusElement.textContent =
    `Compared ${sortedRates[0].date} with ${sortedRates[sortedRates.length - 1].date
    }.`;
}