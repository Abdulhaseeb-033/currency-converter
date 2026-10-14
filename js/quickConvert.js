
export function initQuickConvert({ getLatestRate, formatAmount }) {
    const quickConvertAmount = document.querySelector("#quickConvertAmount");
    const quickConvertFrom = document.querySelector("#quickConvertFrom");
    const quickConvertTo = document.querySelector("#quickConvertTo");
    const quickConvertSwap = document.querySelector("#quickConvertSwap");
    const quickConvertBtn = document.querySelector("#quickConvertBtn");
    const quickConvertResult = document.querySelector("#quickConvertResult");
    const quickConvertRate = document.querySelector("#quickConvertRate");
    const quickConvertStatus = document.querySelector("#quickConvertStatus");

    async function convertQuickAmount() {
        const amount = Number(quickConvertAmount.value);
        const from = quickConvertFrom.value;
        const to = quickConvertTo.value;

        if (
            quickConvertAmount.value.trim() === "" ||
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            quickConvertStatus.textContent = "Enter a valid amount.";
            return;
        }

        quickConvertBtn.disabled = true;
        quickConvertStatus.textContent = "Converting...";

        try {
            const rateData = from === to
                ? { rate: 1 }
                : await getLatestRate(from, to);

            const rate = rateData.rate;

            const convertedAmount = amount * rate;

            quickConvertResult.textContent = formatAmount(convertedAmount);

            quickConvertRate.textContent =
                `1 ${from} = ${formatAmount(rate)} ${to}`;

            quickConvertStatus.textContent = "Conversion successful.";
        } catch (error) {
            console.error("Quick conversion failed:", error);

            quickConvertResult.textContent = "—";
            quickConvertRate.textContent = "Rate unavailable";
            quickConvertStatus.textContent =
                "Unable to convert. Please try again.";
        } finally {
            quickConvertBtn.disabled = false;
        }
    }

    quickConvertBtn.addEventListener("click", convertQuickAmount);

    quickConvertSwap.addEventListener("click", () => {
        const previousFrom = quickConvertFrom.value;

        quickConvertFrom.value = quickConvertTo.value;
        quickConvertTo.value = previousFrom;

        convertQuickAmount();
    });

    quickConvertFrom.addEventListener("change", () => {
        quickConvertResult.textContent = "—";
        quickConvertRate.textContent = "—";
        quickConvertStatus.textContent = "Ready to convert.";
    });

    quickConvertTo.addEventListener("change", () => {
        quickConvertResult.textContent = "—";
        quickConvertRate.textContent = "—";
        quickConvertStatus.textContent = "Ready to convert.";
    });
}
