/**
 * @deprecated
 * Note: The dashboard layout has been refactored from a vertical sidebar to a
 * horizontal top navigation bar. Navigation logic is now handled in `js/app.js`.
 * This file is retained for reference and is no longer part of the active application flow.
 */

export function initSidebar() {
    const sidebar = document.querySelector(".sidebar");
    const collapseBtn = document.querySelector("#sidebarCollapseBtn");
    const mobileMenuBtn = document.querySelector("#mobileMenuBtn");
    const sidebarOverlay = document.querySelector("#sidebarOverlay");

    if (!sidebar || !collapseBtn || !mobileMenuBtn || !sidebarOverlay) {
        return;
    }

    collapseBtn.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
        sidebar.classList.toggle("expanded");

        const isCollapsed = sidebar.classList.contains("collapsed");

        collapseBtn.title = isCollapsed
            ? "Expand sidebar"
            : "Collapse sidebar";

        collapseBtn.setAttribute(
            "aria-label",
            collapseBtn.title
        );

        collapseBtn.innerHTML = isCollapsed
            ? '<i data-lucide="panel-left-open"></i>'
            : '<i data-lucide="panel-left-close"></i>';

        lucide.createIcons();
    });

    function openMobileSidebar() {
        sidebar.classList.add("mobile-open");
        sidebarOverlay.classList.add("visible");

        mobileMenuBtn.setAttribute("aria-expanded", "true");
        mobileMenuBtn.setAttribute(
            "aria-label",
            "Close navigation menu"
        );
    }

    function closeMobileSidebar() {
        sidebar.classList.remove("mobile-open");
        sidebarOverlay.classList.remove("visible");

        mobileMenuBtn.setAttribute("aria-expanded", "false");
        mobileMenuBtn.setAttribute(
            "aria-label",
            "Open navigation menu"
        );
    }

    mobileMenuBtn.addEventListener("click", () => {
        const isOpen = sidebar.classList.contains("mobile-open");

        if (isOpen) {
            closeMobileSidebar();
        } else {
            openMobileSidebar();
        }
    });

    sidebarOverlay.addEventListener("click", closeMobileSidebar);

    window.addEventListener("resize", () => {
        if (window.innerWidth > 767) {
            closeMobileSidebar();
        }
    });
}
