window.addEventListener('popstate', router);
window.addEventListener('load', router);

function router() {
    let targetSection = document.getElementById(location.pathname);
    if (targetSection) targetSection.scrollIntoView();
}