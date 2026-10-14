
export function initSavedPairs({ getSelectedPair, onSelectPair }) {
    const savePairBtn = document.querySelector("#savePairBtn");
    const savedPairsList = document.querySelector("#savedPairsList");

    let savedPairs = [];

    try {
        savedPairs = JSON.parse(
            localStorage.getItem("savedCurrencyPairs") || "[]"
        );

        if (!Array.isArray(savedPairs)) {
            savedPairs = [];
        }
    } catch (error) {
        console.error("Failed to load saved pairs:", error);
        savedPairs = [];
    }

    function savePairsToStorage() {
        localStorage.setItem(
            "savedCurrencyPairs",
            JSON.stringify(savedPairs)
        );
    }

    function renderSavedPairs() {
        savedPairsList.replaceChildren();

        if (savedPairs.length === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.className = "saved-pairs-empty";
            emptyMessage.textContent =
                'No saved pairs yet. Use "Save Pair" to add one.';

            savedPairsList.append(emptyMessage);
            return;
        }

        savedPairs.forEach((pair) => {
            const card = document.createElement("div");
            card.className = "saved-pair-card";

            const pairInfo = document.createElement("div");
            pairInfo.className = "saved-pair-info";

            const pairLabel = document.createElement("span");
            pairLabel.className = "saved-pair-label";
            pairLabel.textContent = `${pair.from} / ${pair.to}`;

            const selectButton = document.createElement("button");
            selectButton.type = "button";
            selectButton.className = "saved-pair-select";
            selectButton.textContent = "Select";

            selectButton.addEventListener("click", () => {
                onSelectPair(pair);

                window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                });
            });

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.className = "saved-pair-remove";
            removeButton.textContent = "Remove";
            removeButton.setAttribute(
                "aria-label",
                `Remove ${pair.from} to ${pair.to}`
            );

            removeButton.addEventListener("click", () => {
                savedPairs = savedPairs.filter((savedPair) => {
                    return !(
                        savedPair.from === pair.from &&
                        savedPair.to === pair.to
                    );
                });

                savePairsToStorage();
                renderSavedPairs();
            });

            pairInfo.append(pairLabel);
            card.append(pairInfo, selectButton, removeButton);
            savedPairsList.append(card);
        });
    }

    function saveCurrentPair() {
        const { from, to } = getSelectedPair();

        if (from === to) {
            savePairBtn.querySelector("span").textContent =
                "Choose Different Currencies";
            return;
        }

        const pairAlreadySaved = savedPairs.some((pair) => {
            return pair.from === from && pair.to === to;
        });

        if (pairAlreadySaved) {
            savePairBtn.querySelector("span").textContent =
                "Already Saved";
            return;
        }

        savedPairs.push({ from, to });

        savePairsToStorage();
        renderSavedPairs();

        savePairBtn.querySelector("span").textContent = "Saved!";
    }

    savePairBtn.addEventListener("click", saveCurrentPair);

    renderSavedPairs();
}
