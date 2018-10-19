addEventListener('popstate', router);

function router() {
    let targetSection = document.getElementById(location.pathname);
    if (targetSection) targetSection.scrollIntoView();
}