
export function initTopNavigation() {
    const mobileMenuBtn = document.querySelector("#mobileMenuBtn");
    const topNavLinks = document.querySelector("#topNavLinks");
    const navLinks = document.querySelectorAll(".top-nav-link");

    function setMobileMenuState(isOpen) {
        if (!topNavLinks || !mobileMenuBtn) return;

        topNavLinks.classList.toggle("is-open", isOpen);
        mobileMenuBtn.setAttribute("aria-expanded", String(isOpen));
        mobileMenuBtn.setAttribute(
            "aria-label",
            isOpen ? "Close navigation menu" : "Open navigation menu"
        );

        mobileMenuBtn.innerHTML = isOpen
            ? '<i data-lucide="x"></i>'
            : '<i data-lucide="menu"></i>';

        if (window.lucide && typeof window.lucide.createIcons === "function") {
            window.lucide.createIcons();
        }
    }

    if (mobileMenuBtn && topNavLinks) {
        mobileMenuBtn.addEventListener("click", () => {
            const isOpen = topNavLinks.classList.contains("is-open");
            setMobileMenuState(!isOpen);
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && topNavLinks.classList.contains("is-open")) {
                setMobileMenuState(false);
                mobileMenuBtn.focus();
            }
        });

        document.addEventListener("click", (event) => {
            if (
                topNavLinks.classList.contains("is-open") &&
                !topNavLinks.contains(event.target) &&
                !event.composedPath().includes(mobileMenuBtn)
            ) {
                setMobileMenuState(false);
            }
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 767 && topNavLinks.classList.contains("is-open")) {
                setMobileMenuState(false);
            }
        });
    }

    function setActiveLink(hash) {
        navLinks.forEach((link) => {
            const linkHref = link.getAttribute("href");
            const isActive = linkHref === hash;

            link.classList.toggle("active", isActive);

            if (isActive) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }

    navLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            const href = link.getAttribute("href");
            if (!href || !href.startsWith("#")) return;

            event.preventDefault();

            if (topNavLinks && topNavLinks.classList.contains("is-open")) {
                setMobileMenuState(false);
            }

            const targetSection = document.querySelector(href);

            if (targetSection) {
                targetSection.scrollIntoView({ behavior: "smooth" });
                setActiveLink(href);

                if (window.history && window.history.pushState) {
                    window.history.pushState(null, "", href);
                } else {
                    window.location.hash = href;
                }
            }
        });
    });

    const sectionsToObserve = [
        { id: "home", el: document.querySelector("#home") },
        { id: "markets", el: document.querySelector("#markets") },
        { id: "exchange", el: document.querySelector("#exchange") },
        { id: "saved-pairs", el: document.querySelector("#saved-pairs") },
    ].filter((item) => item.el !== null);

    function updateActiveLinkOnScroll() {
        const nav = document.querySelector(".top-navigation");
        const navHeight = nav ? nav.offsetHeight : 72;

        const activationPoint = navHeight + 40;
        const lastSection = sectionsToObserve[sectionsToObserve.length - 1];

        const pageBottom =
            window.scrollY + window.innerHeight >=
            document.documentElement.scrollHeight - 5;

        if (pageBottom && lastSection) {
            setActiveLink(`#${lastSection.id}`);
            return;
        }

        let currentSection = sectionsToObserve[0]?.id || "home";
        let closestDistance = Infinity;

        sectionsToObserve.forEach((section) => {
            const rect = section.el.getBoundingClientRect();

            if (
                rect.top <= activationPoint &&
                rect.bottom > activationPoint
            ) {
                currentSection = section.id;
                closestDistance = 0;
                return;
            }

            if (closestDistance !== 0) {
                const distance = Math.abs(rect.top - activationPoint);

                if (distance < closestDistance && rect.top <= activationPoint) {
                    closestDistance = distance;
                    currentSection = section.id;
                }
            }
        });

        setActiveLink(`#${currentSection}`);
    }

    window.addEventListener("scroll", updateActiveLinkOnScroll, {
        passive: true,
    });

    updateActiveLinkOnScroll();
}
